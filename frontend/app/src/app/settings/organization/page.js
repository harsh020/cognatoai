"use client"

import {useMemo, useState} from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {Mail, X, Plus, Trophy, Phone, Building} from 'lucide-react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {buildJsonFromForm, cn, getOrganization} from "@/lib/utils";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useEffect} from "react";
import {DATA} from "@/lib/data";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import Loader from "@/components/loader";
import {useDispatch, useSelector} from "react-redux";
import {retrieveOrganization, updateOrganization} from "@/store/organization/actions";
import NoData from "@/components/no-data";



function OrganizationCard() {
  const router = useRouter();

  // Mock user data based on provided JSON structure
  const {
    user
  } = useSelector(state => state.retrieveUser);

  const dispatch = useDispatch();
  const { error: updateError, loading: updateLoading, organization: updatedOrganization } = useSelector(state => state.updateOrganization);
  const { error, loading, organization } = useSelector(state => state.retrieveOrganization)

  // Initial form data for editable fields
  const initialFormData = {
    name: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!error && !loading && !organization) {
      dispatch(retrieveOrganization(
        getOrganization()
      ))
    } else if (organization) {
      setFormData({
        name: organization.name,
        description: organization.description
      })
    }
  }, [error, loading, organization]);

  // Handlers for form actions
  const handleCancel = () => {
    setFormData(initialFormData); // Reset to initial state
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate text fields (same as before)
    if (!formData.name.trim()) newErrors.name = "Organization name is required.";
    else if (formData.name.length > 50) newErrors.first_name = "Organization name cannot exceed 50 characters.";

    // if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (formData.description.length > 500) newErrors.description = "Description cannot exceed 500 characters.";

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please check the form for errors.");
      return;
    }

    console.log('Updated profile data:', formData);
  };

  return (
    <div className='h-full w-full m-auto'>
      {
        loading ? (
          <Loader className='h-[calc(100vh-5.2rem)]' />
        ) : organization ? (
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
                      <AvatarFallback>
                        <Building className='h-full w-full p-4' />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* User Information */}
                  <div className="p-6 pt-12">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold">{organization.name}</h1>
                    </div>
                    {/*<p className="text-sm text-gray-500 mt-1">{user.email}</p>*/}
                  </div>

                  {/* Statistics Section */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-foreground/50">Total interviews scheduled</p>
                      <p className="font-medium">{organization.total_interviews || 0}</p>
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
                  <form onSubmit={handleSubmit} id='organizationForm' className="p-6 space-y-6">
                    <table className='w-full h-full'>
                      <tbody>
                        <tr>
                          <td className='p-1'>
                            <Label className="text-sm font-medium">Name</Label>
                          </td>

                          <td className='p-1'>
                            <Input
                              id="name"
                              name="name"
                              placeholder="e.g.: Coinbase"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={loading}
                              className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
                            />
                            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                          </td>
                        </tr>

                        <tr>
                          <td className='p-1'>
                            <Label className="text-sm font-medium">Description</Label>
                          </td>

                          <td className='p-1'>
                            <Textarea
                              id="description"
                              name="description"
                              placeholder="e.g.: Coinbase"
                              value={formData.description}
                              onChange={handleInputChange}
                              disabled={loading}
                              className={cn(errors.description && "border-red-500 focus-visible:ring-red-500")}
                            />
                            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
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
                <Button disabled={updateLoading} form='organizationForm' type='submit'>
                  {updateLoading ? (
                    <Loader />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <NoData className='h-[calc(100vh-5.2rem)]' text='Something went wrong when fetching details. Please try again later.' />
        )
      }
    </div>
  );
}

export default function OrganizationScreen(props) {

  return (
    <div className='flex flex-col w-full gap-4 p-4'>
      <div className='flex flex-row w-full'>
        <OrganizationCard />
      </div>

    </div>
  );
}