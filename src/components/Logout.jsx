import React from "react";
import axios from "axios";
import { Button } from "@mui/material";
function handleLogout() {
  axios
    .post(
      `${process.env.React_APP_API_URL}/portal-app/authentication/backend/api/logout.php`
    )
    .then(() => {
      sessionStorage.clear();
      window.location.href = "/portal-app/en/login";
    })
    .catch((error) => {
      console.error(error);
    });
}

export default function LogoutButton() {
  return <Button onClick={() => handleLogout()}>Logout</Button>;
}
