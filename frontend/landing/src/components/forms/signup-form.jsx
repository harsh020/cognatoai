"use client"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import Link from "next/link";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {register} from "@/store/user/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import Loader from "@/components/loader";
import {redirect} from "@/store/social/actions";

export function SignupForm({
  className,
  onSignupSuccess,
  ...props
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { error, loading, user } = useSelector(state => state.register);
  const { error: socialAuthError, loading: socialAuthLoading, socialAuth } = useSelector(state => state.redirect);

  const initialFormData = {
    'first_name': user?.first_name || "",
    'last_name': user?.last_name || "",
    'email': user?.email || "",
    'password': user?.password || "",
  }
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(user) {
      // onSignupSuccess(user.email);
      onSignupSuccess();
    }
  }, [error, user]);

  useEffect(() => {
    if(socialAuthError) {
      toast.error(error.message);
    } else if(socialAuth) {
      window.location.href = socialAuth.url;
    }
  }, [error, socialAuth]);


  const validateForm = () => {
    const newErrors = {};

    // Validate text fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required.";
    } else if (formData.first_name.length > 50) {
      newErrors.first_name = "First name cannot exceed 50 characters.";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required.";
    } else if (formData.last_name.length > 50) {
      newErrors.last_name = "Last name cannot exceed 50 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = "Password is required.";
    } else {
      if (formData.password.length < 8) {
        newErrors.new_password = "Password must be at least 8 characters.";
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = "Password must include at least one lowercase letter.";
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "Password must include at least one uppercase letter.";
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Password must include at least one number.";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        newErrors.password = "Password must include at least one special character.";
      }
    }

    return newErrors;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Optionally clear the specific error when the user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please check the form for errors.");
      return;
    }

    // --- Get form data ---
    // Using FormData is robust, alternatively manage state for each input
    // --- Simulate API Call ---
    dispatch(register(formData));
  }

  const handleSocialAuth = (e, provider) => {
    e.preventDefault();

    dispatch(redirect({
      provider: provider,
      redirect_uri: process.env.NEXT_PUBLIC_SOCIAL_AUTH_REDIRECT_URI_TEMPLATE.replace('{provider}', provider),
    }));
  }



  return (
    <form id='signupForm' onSubmit={handleSignup} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter the details below to create an account
        </p>
      </div>
      <div className="grid gap-6">
        <div className='grid grid-cols-2 gap-2'>
          <div className="grid gap-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              placeholder="Jon"
              disabled={loading}
              value={formData.first_name}
              onChange={handleInputChange}
            />
            {errors.first_name && <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              placeholder="Doe"
              disabled={loading}
              value={formData.last_name}
              onChange={handleInputChange}
            />
            {errors.last_name && <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            disabled={loading}
            value={formData.email}
            onChange={handleInputChange}
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            disabled={loading}
            value={formData.password}
            onChange={handleInputChange}
          />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
        </div>
        <Button form='signupForm' type="submit" className="w-full" disabled={loading || socialAuthLoading}>
          {
            loading ? (
              <Loader />
            ) : (
              'Sign up'
            )
          }
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button type="button" variant="outline" className="w-full" disabled={loading || socialAuthLoading} onClick={(e) => handleSocialAuth(e, 'google')}>
          {
            socialAuthLoading ? (
              <Loader />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Google
              </>
            )
          }
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  )
}
