import React from 'react';
import { Box, Typography, Button, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import logoSrc from '../assets/images/logo.png';
import Logout from './Logout';

function Header() {
  const isSmallScreen = useMediaQuery('(max-width: 768px)'); // Adjust breakpoint as needed

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row', // Stack on small screens
        alignItems: isSmallScreen ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        padding: '16px',
        marginBottom: '5px',
        backgroundColor: '#121212',
      }}
    >
      {/* Left Column: Logo */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <img src={logoSrc} alt="Logo" style={{ maxHeight: '40px' }} />
      </Box>

      {/* Middle Column: Heading */}
      <Box
        sx={{
          flex: isSmallScreen ? 1 : 2, // Adjust flex based on screen size
          textAlign: isSmallScreen ? 'left' : 'center',
          color: '#fff',
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          justifyContent: isSmallScreen ? 'flex-start' : 'center',
          gap: isSmallScreen ? 1 : 4,
          mt: isSmallScreen ? 2 : 0, // Add top margin on small screens
        }}
      >
        <Typography variant="h6">
          <Link
            to="/en/dashboard"
            underline="none"
            color="inherit"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Management
          </Link>
        </Typography>

        <Typography variant="h6">
          <Link
            to="/en/reservations"
            underline="none"
            color="inherit"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Reservations
          </Link>
        </Typography>
      </Box>

      {/* Right Column: Button */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: isSmallScreen ? 'flex-start' : 'flex-end',
          alignItems: 'center',
          mt: isSmallScreen ? 2 : 0, // Add top margin on small screens
        }}
      >
        <Logout />
      </Box>
    </Box>
  );
}

export default Header;