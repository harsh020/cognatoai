"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {Mail, X, Plus, Trophy, Phone} from 'lucide-react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {buildJsonFromForm, cn} from "@/lib/utils";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useEffect} from "react";
import {DATA} from "@/lib/data";
import {Label} from "@/components/ui/label";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {USER_UPDATE_RESET} from "@/store/user/constants";
import {updateUser} from "@/store/user/actions";
import Loader from "@/components/loader";



function ProfileCardV2(props) {
  // const dispatch = useDispatch();
  const user = DATA.userProfile;

  // User is always fetched in App component
  // const { user } = useSelector(state => state.retrieveUser);
  // const { error, loading, user: updatedUser } = useSelector(state => state.updateUser);

  // useEffect(() => {
  //   if(error) {
  //     toast.error(error.message);
  //   } else if(updatedUser) {
  //     toast.success('Profile updated successfully!');
  //     dispatch({
  //       type: USER_UPDATE_RESET,
  //     })
  //   }
  // }, [error, loading, updatedUser]);


  const onSubmitHandler = (e) => {
    e.preventDefault();


    const data = buildJsonFromForm(e.target);
    delete data['email'];

    // dispatch(updateUser(data));
  }

  return (
    <Card className='h-full w-full'>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
        {/*<CardDescription>Update details of the currently selected organization.</CardDescription>*/}
      </CardHeader>

      <CardContent className='h-full w-full'>
        <div className='flex flex-col'>
          <form className={cn(
            'flex flex-col',
            props.className
          )}
                id='profileForm'
                onSubmit={onSubmitHandler}
                {...props}
          >
            {/*<div className='flex flex-row  font-semibold text-lg pb-4'>*/}
            {/*  Update Profile*/}
            {/*</div>*/}

            <div className='flex flex-col md:w-[60%] w-full gap-4'>
              <div className='flex flex-row w-full gap-x-4'>
                <div className='flex flex-col w-full'>
                  <Input label='first_name' type='text' placeholder='First Name' defaultValue={user.first_name} required />
                </div>

                <div className='flex flex-col w-full'>
                  <Input label='last_name' type='text' placeholder='Last Name' defaultValue={user.last_name} required />
                </div>
              </div>

              <div className='flex flex-row w-full gap-x-4'>
                <div className='flex flex-col w-full'>
                  <Input label='email' type='email' placeholder='Email' defaultValue={user.email} disabled={true} required />
                </div>

                <div className='flex flex-col w-full'>
                  <Input label='phone' type='phone' defaultValue={user.phone} placeholder='+919876543210' validate='[+]{1}[1-9]{1}[0-9]{0,2}[1-9]{1}[0-9]{6,14}' required />
                </div>
              </div>
            </div>
          </form>
        </div>

      </CardContent>
      <CardFooter>
        <div className='flex flex-row gap-x-4'>
          <Button type='submit' form='profileForm' variant='default' loading={false}>
            Update
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function PasswordCard(props) {
  const dispatch = useDispatch();

  const { error, loading, success } = useSelector(state => state.changePassword);

  const initialFormData = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  }
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(success) {
      toast.success('Password changed successfully!');
    }
  }, [error, loading, success]);

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

  const validateForm = () => {
    const newErrors = {};

    const { current_password, new_password, confirm_password } = formData;

    // 1. Current password is required
    if (!current_password || current_password.trim() === '') {
      newErrors.current_password = "Current password is required.";
    }

    // 2. New password checks
    if (!new_password || new_password.trim() === '') {
      newErrors.new_password = "New password is required.";
    } else {
      if (new_password.length < 8) {
        newErrors.new_password = "Password must be at least 8 characters.";
      } else if (!/[a-z]/.test(new_password)) {
        newErrors.new_password = "Password must include at least one lowercase letter.";
      } else if (!/[A-Z]/.test(new_password)) {
        newErrors.new_password = "Password must include at least one uppercase letter.";
      } else if (!/[0-9]/.test(new_password)) {
        newErrors.new_password = "Password must include at least one number.";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(new_password)) {
        newErrors.new_password = "Password must include at least one special character.";
      }
    }

    // 3. Confirm password match
    if (!confirm_password || confirm_password.trim() === '') {
      newErrors.confirm_password = "Please confirm your new password.";
    } else if (new_password !== confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    return newErrors;
  };



  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please check the form for errors.");
      return;
    }

    // const data = buildJsonFromForm(e.target);
    // dispatch(changePassword(data));
  }

  return (
    <Card className='w-full h-full justify-between'>
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
        {/*<CardDescription>Update details of the currently selected organization.</CardDescription>*/}
      </CardHeader>

      <CardContent className='h-full w-full'>
        <div className='flex flex-col'>
          <form className={cn(
            'flex flex-col',
            props.className
          )}
            id='passwordForm'
            onSubmit={handleSubmit}
            {...props}
          >
            {/*<div className='flex flex-row  font-semibold text-lg pb-4'>*/}
            {/*  Organization Details*/}
            {/*</div>*/}

            <div className='flex flex-col md:w-[60%] w-full gap-4'>
              {/*<div className='flex flex-row w-full gap-x-4'>*/}
              {/*  <Input label='current_password' type='password' placeholder='Current Password' required />*/}
              {/*</div>*/}

              {/*<div className='flex flex-row w-full'>*/}
              {/*  <Input label='new_password' type='password' placeholder='New Password' required />*/}
              {/*</div>*/}

              <div className="space-y-1.5">
                <Label htmlFor="current_password">Current Password</Label>
                <Input type='password' id="current_password" name="current_password" value={formData.current_password} onChange={handleInputChange} disabled={loading} className={cn(errors.current_password && "border-red-500 focus-visible:ring-red-500")} />
                {errors.current_password && <p className="text-sm text-red-600 mt-1">{errors.current_password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_password">New Password</Label>
                <Input type='password' id="new_password" name="new_password"  value={formData.new_password} onChange={handleInputChange} disabled={loading} className={cn(errors.new_password && "border-red-500 focus-visible:ring-red-500")} />
                {errors.new_password && <p className="text-sm text-red-600 mt-1">{errors.new_password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input type='password' id="confirm_password" name="confirm_password" value={formData.confirm_password} onChange={handleInputChange} disabled={loading} className={cn(errors.confirm_password && "border-red-500 focus-visible:ring-red-500")} />
                {errors.confirm_password && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>
          </form>
        </div>

      </CardContent>
      <CardFooter>
        <div className="pb-4 flex ">
          <Button disabled={loading} form='passwordForm' type='submit'>
            {loading ? (
              <Loader />
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function ProfileCard() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector(state => state.retrieveUser);
  const { error, loading, user: updatedUser } = useSelector(state => state.updateUser);

  // Initial form data for editable fields
  const initialFormData = {
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(updatedUser) {
      toast.success('Profile updated successfully!');
      dispatch({
        type: USER_UPDATE_RESET,
      })
    }
  }, [error, loading, updatedUser]);

  // Handlers for form actions
  const handleCancel = () => {
    setFormData(initialFormData); // Reset to initial state
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate text fields (same as before)
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
    else if (formData.first_name.length > 50) newErrors.first_name = "First name cannot exceed 50 characters.";

    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
    else if (formData.last_name.length > 50) newErrors.last_name = "Last name cannot exceed 50 characters.";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (formData.phone.length < 10) newErrors.phone = "Phone number must be at least 10 digits.";
    else if (formData.phone.length > 15) newErrors.phone = "Phone number seems too long.";
    else if (!/^[+\d\s().-]+$/.test(formData.phone)) newErrors.phone = "Please enter a valid phone number format.";

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

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please check the form for errors.");
      return;
    }

    dispatch(updateUser(formData));
  };

  return (
    <Card className='h-full w-full p-0'>
      <CardContent className='h-full w-full p-0'>
        <div className="items-center justify-center">
          <div className="w-full p-2">
            {/* Header with Navigation and Close Button */}
            {/*<div className="relative bg-gradient-to-r from-purple-500 to-indigo-500 p-8 rounded-t-lg">*/}

            {/*</div>*/}

            {/* Profile Picture and Banner */}
            <div className="relative bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg h-42">
              <Avatar className="h-24 w-24 absolute -bottom-10 left-6 border-4 border-card rounded-full">
                <AvatarImage src={user.profile_picture || '/app/illustrations/profilie-pic-1-sm.webp'} alt="Profile Picture" />
                <AvatarFallback>SS</AvatarFallback>
              </Avatar>
            </div>

            {/* User Information */}
            <div className="p-6 pt-12">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">{user.first_name || user.email.split('@')[0]} {user.last_name}</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-sm text-foreground/50">Total interviews scheduled</p>
                <p className="font-medium">{user.total_interviews || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground/50">Joined</p>
                <p className="font-medium">{format(new Date(user.date_joined), 'MMM dd yyyy')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground/50">Plan</p>
                <p className="font-medium text-green-600">Free</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Daily time</p>
                <p className="font-medium">3 hrs</p>
              </div>
            </div>

            {/* Editable Fields */}
            <form id='profileForm' onSubmit={handleSubmit} className="p-6 space-y-6">
              <table className='w-full h-full'>

                <tbody>
                <tr>
                  <td className="p-1">
                    <Label className="text-sm font-medium">Name</Label>
                  </td>

                  <td className="p-1">
                    <Input
                      id="first_name"
                      name="first_name"
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={cn(errors.first_name && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.first_name && <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>}
                  </td>
                  <td className="p-1">
                    <Input
                      id="last_name"
                      name="last_name"
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={cn(errors.last_name && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.last_name && <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>}
                  </td>
                </tr>

                <tr>
                  <td className='p-1'>
                    <Label className="text-sm font-medium">Email address</Label>
                  </td>

                  <td className='p-1'>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                      </span>
                      <Input value={user.email} disabled className="pl-10" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className='p-1'>
                    <Label className="text-sm font-medium">Phone</Label>
                  </td>

                  <td className='p-1'>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                      </span>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="e.g. +1 123 456 7890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={cn('pl-10', errors.phone && "border-red-500 focus-visible:ring-red-500")} />
                    </div>
                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                  </td>
                </tr>
                </tbody>

              </table>
            </form>

          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="pb-4 flex ">
          <Button disabled={loading} form='profileForm' type='submit'>
            {loading ? (
              <Loader />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function SettingsScreen(props) {

  return (
    <div className='flex flex-col w-full gap-4 p-4'>
      <div className='flex flex-row w-full'>
        <ProfileCard />
      </div>

      <div className='flex flex-row w-full'>
        <PasswordCard />
      </div>
    </div>
  );
}

export default SettingsScreen;
