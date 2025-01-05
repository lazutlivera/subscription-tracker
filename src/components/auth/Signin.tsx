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
  const [loginError, setLoginError] = useState<string>('');

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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to login");
            }

            return data; // Return the full response data

        } catch (error) {
            console.error(error);
            throw error; // Throw the error instead of returning it
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
        setLoginError('');
        const form = event.currentTarget;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        const errors = validate();
        const isValid = Object.keys(errors).length === 0;

        if(isValid){
            try {
                const userData = {email: email, password: password };
                const data = await signIn(userData);
                
                if (data.token) {
                    window.localStorage.setItem("token", data.token);
                    router.push("/");
                }
            } catch (error) {
                console.error("Error logging in:", error);
                setLoginError('Invalid email or password');
            }
        } else {
            console.error("Validation errors:", errors);
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
          {loginError && (
            <div className="mb-6 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 font-normal text-center">
                {loginError}
              </p>
            </div>
          )}
          
          {Object.keys(formState.errors).length > 0 && (
            <div className="mb-6 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20">
              {Object.values(formState.errors).map((error, index) => (
                <p key={index} className="text-sm text-red-400 font-normal">
                  {error}
                </p>
              ))}
            </div>
          )}

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

