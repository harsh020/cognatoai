"use client"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {authenticate} from "@/store/user/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import Loader from "@/components/loader";
import {redirect} from "@/store/social/actions";

export function LoginForm({
  className,
  ...props
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const initialFormData = {
    email: "",
    password: "",
  }
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const { error, loading, user } = useSelector(state => state.authenticate);
  const { error: socialAuthError, loading: socialAuthLoading, socialAuth } = useSelector(state => state.redirect);

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(user) {
      toast.success("Login Successful!");
      router.replace('/auth/login/success');
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
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length > 50) {
      newErrors.password = "Password cannot exceed 50 characters.";
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

  const handleLogin = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please check the form for errors.");
      return;
    }

    dispatch(authenticate(formData));
  }

  const handleSocialAuth = (e, provider) => {
    e.preventDefault();

    dispatch(redirect({
      provider: provider,
      redirect_uri: process.env.NEXT_PUBLIC_SOCIAL_AUTH_REDIRECT_URI_TEMPLATE.replace('{provider}', provider),
    }));
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id='loginForm' onSubmit={handleLogin}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
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
                        Continue with Google
                      </>
                    )
                  }
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
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
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
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
                <Button form='loginForm' type="submit" className="w-full" disabled={loading || socialAuthLoading}>
                  {
                    loading ? (
                      <Loader />
                    ) : (
                      'Login'
                    )
                  }
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
