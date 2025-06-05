import React from "react";
import { Box, Typography, Button, Link } from "@mui/material";
import logoSrc from "../assets/images/logo.png";
import Logout from "./Logout";
function Header() {
  const isMobile = window.innerWidth <= 768;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row",

        padding: "16px",
        marginBottom: "5px",
        backgroundColor: "#121212", // Example background color
      }}
    >
      {/* Left Column: Logo */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
        <img src={logoSrc} alt="Logo" style={{ maxHeight: "40px" }} />
      </Box>

      {/* Middle Column: Heading */}
      <Box
        sx={{
          flex: 2,
          textAlign: "center",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {/* Dashboard Link */}
        <Typography variant="h6">
          <Link
            href="/portal-app/dashboard"
            underline="none"
            color="inherit"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Management
          </Link>
        </Typography>

        {/* Reservations Link */}
        <Typography variant="h6">
          <Link
            href="/portal-app/reservations"
            underline="none"
            color="inherit"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Reservations
          </Link>
        </Typography>
      </Box>

      {/* Right Column: Button */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          onClick={Logout}
          sx={{ backgroundColor: "red", color: "white" }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default Header;
