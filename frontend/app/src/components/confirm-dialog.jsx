"use client"

import React, {useState} from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {cn, toTitleCase} from "@/lib/utils";
import Loader from "@/components/loader";

function getStyle(variant) {
  switch (variant) {
    case 'delete':
      return 'text-white bg-destructive hover:bg-destructive/80';
    case 'cancel':
      return 'text-white bg-destructive hover:bg-destructive/80';
    default:
      return 'text-white bg-blue-600 hover:bg-blue-600/80';
  }
}

function ConfirmDialog({ loading, isOpen, onOpenChange, title, description, variant, handleAction, children}) {

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={cn(getStyle(variant))} onClick={handleAction}>
            {
              loading ? (
                <Loader />
              ) : (
                'Confirm'
              )
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  );
}

export default ConfirmDialog;