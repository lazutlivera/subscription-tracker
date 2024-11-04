'use client';
import React, { useState } from "react";
import endpoints from "../../utils/endpoints";
import { useRouter } from "next/navigation";

interface FormValues {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

interface FormState {
    values: FormValues;
    errors: FormValues;
    status: "pending" | "success" | "error"
  }

export default function Signup() {
    const router = useRouter();
    const [formState, setFormState] = useState<FormState>({values: {name: "", email: "", password: "", confirmPassword: ""}, errors: {}, status: "pending"});
    
    const signupUser = async (userData: { name: string, email: string; password: string }) => {
       
        try {
            const response = await fetch(endpoints.auth.signup, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                setFormState({values: formState.values, errors: formState.errors, status: "error"});
                throw new Error(`Error: ${response.status} - ${errorData.error || "Failed to create user"}`);
            }
            setFormState({values: formState.values, errors: formState.errors, status: "success"});
            return await response.json();
    
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const validate = () => {
        const newErrors: FormValues = {};

        const {values} = formState;

        if (!values.name) {
            newErrors.email = 'Name is required';
        }

        if (!values.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            newErrors.email = 'Email address is invalid';
        }
      
        if (!values.password) {
            newErrors.password = 'Password is required';
        } else if (values.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!values.confirmPassword) {
            newErrors.confirmPassword = 'Password needs to be confirmed';
        } else if (values.confirmPassword !== values.password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setFormState({values: values, errors: newErrors, status: "pending"});
        return newErrors;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newValues = {...formState.values, [name]: value};
        setFormState({values: newValues, errors: formState.errors, status: formState.status});
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        const errors = validate();
        const isValid = Object.keys(errors).length === 0;

        if(isValid){
            const userData = {name: name, email: email, password: password };
            await signupUser(userData);
            router.push("/signin");
        } else {
            console.log("Error creating user.")
            console.log(errors);
        }

    }

    if(formState.status === "success") {
      return (
        <>
        <p>Your account has been created.</p>
        </>
      )
    } else {
      return (
        <>
       <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
            Create an account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-white">
                Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              {formState.errors?.name && <div className="text-red-700">{formState.errors?.name}</div>} 
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                Email address
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
              {formState.errors?.email && <p className="text-red-700">{formState.errors?.email}</p>} 
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
              {formState.errors?.password && <div className="text-red-700">{formState.errors?.password}</div>} 
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-white">
                  Confirm Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              {formState.errors?.confirmPassword && <p className="text-red-700">{formState.errors?.confirmPassword}</p>} 
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg p-3 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
</>
)
    }
}