import React, { useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
// import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    axios
      .post("https://blogpepper.com/backend/api/login.php", {
        email: email,
        password: password,
      })
      .then((response) => {
        if (response.data.status === "success") {
          sessionStorage.setItem("loggedIn", true);
          sessionStorage.setItem(
            "userData",
            JSON.stringify(response.data.data)
          );

          window.location.href = "/portal-app/dashboard";
        } else {
          setError(response.data.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "5%",
      }}
    >
      <Container maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <Typography
            style={{ marginBottom: "20px" }}
            variant="h2"
            component="h2"
          >
            Sign in
          </Typography>
          {error && (
            <Alert style={{ marginBottom: "20px" }} severity="error">
              {error}
            </Alert>
          )}
          <TextField
            type="email"
            value={email}
            onChange={handleEmailChange}
            variant="filled"
            id="email"
            label="Email address"
            fullWidth
            style={{ marginBottom: "20px" }}
          />
          <TextField
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            variant="filled"
            id="password"
            label="Password"
            fullWidth
            style={{ marginBottom: "20px" }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleShowPassword}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          {loading ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <Button variant="contained" type="submit">
              Login
            </Button>
          )}

          {/* <p>
            Don't have an account? <Link href="/register">Sign up</Link>
          </p> */}
        </form>
      </Container>
    </Box>
  );
}

export default Login;
