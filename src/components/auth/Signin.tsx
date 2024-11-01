import React, { useEffect, useState } from "react";
import endpoints from "../../utils/endpoints";
import { useRouter } from "next/navigation";
import useCheckAuth from "@/hooks/useCheckAuth";

interface FormValues {
    email?: string;
    password?: string;
}

interface FormState {
    values: FormValues;
    errors: FormValues;
  }

export default function SignIn() {
  const [formState, setFormState] = useState<FormState>({values: {email: "", password: ""}, errors: {}});

  const { isLoading, isTokenValid } = useCheckAuth();

  if (isLoading) {
    //TODO: Add custom loading screen/logic at somepoint, currently just a whitepage
  }

  if(isTokenValid) {
    console.log("verified token");
    return null
  }
  
  const router = useRouter();

    const signIn = async (userData: { email: string; password: string }) => {
       
        try {
            const response = await fetch(endpoints.auth.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${response.status} - ${errorData.error || "Failed to login"}`);
            }
    
            return await response.json();
    
        } catch (error) {
            console.log(error);
            return error;
        } 
    };

    const validate = () => {
        const newErrors: FormValues = {};

        const {values} = formState;

        if (!values.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            newErrors.email = 'Email address is invalid';
        }

        setFormState({values: values, errors: newErrors});
        return newErrors;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newValues = {...formState.values, [name]: value};
        setFormState({values: newValues, errors: formState.errors});
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        const errors = validate();
        const isValid = Object.keys(errors).length === 0;

        if(isValid){
            const userData = {email: email, password: password };
            const { token } = await signIn(userData);
            window.localStorage.setItem("token", token);
            router.push("/");
        } else {
            console.log("Error logging in.")
            console.log(errors);
        }

    }
    
    return (
        <>
       <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
            Log In
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                Email Address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  formNoValidate
                  autoComplete="email"
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg p-3 transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
</>
)
}

