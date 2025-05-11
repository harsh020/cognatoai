"use client"

import React from 'react';
import {redirect} from "next/navigation";

function Settings(props) {
  redirect('/settings/account');
}

export default Settings;