import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Grid, Typography, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Card, FormControlLabel, Checkbox  } from "@mui/material";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [duration, setDuration] = useState("");
  const [cruiseOptions, setCruiseOptions] = useState({
    multipleDays: false,
    dayCruise: false,
    sunsetCruise: false,
  });
  const [minBlock, setMinBlock] = useState(0);
  const [minBlockUnit, setMinBlockUnit] = useState("Day(s)");
  const [maxBlock, setMaxBlock] = useState(0);
  const [maxBlockUnit, setMaxBlockUnit] = useState("Month(s)");
  const [availability, setAvailability] = useState("available");
  const [minPersons, setMinPersons] = useState(1);
  const [maxPersons, setMaxPersons] = useState(1);
  //const userData = JSON.parse(sessionStorage.getItem("userData"));
  // const username = userData?.username;
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "6px",
          },
        },
      },
    },
  });
  useEffect(() => {
    const loggedIn = sessionStorage.getItem("loggedIn");
    if (!loggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // const response = await axios.get("https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc/v3/products?per_page=50", {
        const response = await axios.get("https://cretaluxurycruises.dev6.inglelandi.com//wp-json/wc-bookings/v1/products?per_page=50", {
          auth: {
            username: "ck_cb8d0d61726f318ddc43be3407749e7a58360fe1",
            password: "cs_bd55fa6bc205f402e50fdc25876032bb9c45b2ba",
          },
        });
        const activeProducts = response.data.filter((product) => product.status === "publish");
        console.warn(activeProducts);
        setProducts(activeProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const mapUnit = (unit) => {
    const unitMapping = {
      month: "Month(s)",
      week: "Week(s)",
      day: "Day(s)",
      hour: "Hour(s)",
    };
    return unitMapping[unit] || "Day(s)";
  };
  const handleProductChange = async (productId) => {
    setFormLoading(true)
    setSelectedProduct(productId);
    try {
      const response = await axios.get(`https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc-bookings/v1/products/${productId}`, {
        auth: {
          username: "ck_cb8d0d61726f318ddc43be3407749e7a58360fe1",
          password: "cs_bd55fa6bc205f402e50fdc25876032bb9c45b2ba",
        },
      });
  
      const productData = response.data;
      console.warn(productData.max_date_value);
      // Assuming the API response structure, update fields accordingly
      setDuration(productData?.acf?.cruise_duration || "00:00 - 00:00");
      setMaxBlock(productData?.max_date_value || 0);
      setMaxBlockUnit(mapUnit(productData?.max_date_unit));
      setMinBlock(productData?.min_date_value || 0);
      setMinBlockUnit(mapUnit(productData?.min_date_unit));
      setMinPersons(productData?.min_persons);
      setMaxPersons(productData?.max_persons);
      setAvailability(productData?.default_date_availability || "available");
      setCruiseOptions({
        multipleDays: productData?.acf?.multiple_days_cruise || false,
        dayCruise: productData?.acf?.day_cruise || false,
        sunsetCruise: productData?.acf?.sunset_cruise || false,
      });
  
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleUpdate = async () => {
    if (!selectedProduct) return;
    setFormLoading(true);

    try {
      await axios.put(
        `https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc-bookings/v1/products/${selectedProduct}`,
        {
          acf: {
            cruise_duration: duration, // ACF field for duration
            multiple_days_cruise: cruiseOptions.multipleDays,
            day_cruise: cruiseOptions.dayCruise,
            sunset_cruise: cruiseOptions.sunsetCruise,
          },  
          meta_data: [
            {
              key: "cruise_duration",
              value: duration,
            },
          ],
          min_block: minBlock,
          min_block_unit: minBlockUnit.toLowerCase().replace("(s)", ""),
          max_block: maxBlock,
          max_block_unit: maxBlockUnit.toLowerCase().replace("(s)", ""),
          default_date_availability: availability === "non-available" ? "" : availability,
          min_persons: minPersons,
          max_persons: maxPersons,
        },
        {
          auth: {
            username: "ck_cb8d0d61726f318ddc43be3407749e7a58360fe1",
            password: "cs_bd55fa6bc205f402e50fdc25876032bb9c45b2ba",
          },
        }
      );
    } catch (error) {
      console.error("Update failed", error.response ? error.response.data : error);
    }

    setFormLoading(false);
};


  return (
    <ThemeProvider theme={darkTheme}>
      <Container>
        <Typography variant="h5" gutterBottom mt={4}>
          WooCommerce Products
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={5}>
            <Card style={{ backgroundColor: "#121212", padding: "20px", textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <StaticDatePicker
                  displayStaticWrapperAs="desktop"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                />
              </LocalizationProvider>
              <TextField
                select
                label="Select Product"
                value={selectedProduct}
                onChange={(e) => handleProductChange(e.target.value)}
                fullWidth
                margin="normal"
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>

              {formLoading ? (
              <CircularProgress />
              ) : (
                  <>
                    <TextField
                      label="Cruise Duration"
                      fullWidth
                      margin="normal"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="0:00 - 00:00"
                    />
                    <Box display="flex" gap={3}>
                      <FormControlLabel
                        control={<Checkbox checked={cruiseOptions.multipleDays} onChange={(e) => setCruiseOptions({ ...cruiseOptions, multipleDays: e.target.checked })} />}
                        label="Multiple Days Cruise"
                      />
                      <FormControlLabel
                        control={<Checkbox checked={cruiseOptions.dayCruise} onChange={(e) => setCruiseOptions({ ...cruiseOptions, dayCruise: e.target.checked })} />}
                        label="Day Cruise"
                      />
                      <FormControlLabel
                        control={<Checkbox checked={cruiseOptions.sunsetCruise} onChange={(e) => setCruiseOptions({ ...cruiseOptions, sunsetCruise: e.target.checked })} />}
                        label="Sunset Cruise"
                      />
                    </Box>
                    <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        label="Min Persons"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={minPersons}
                        onChange={(e) => setMinPersons(e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max Persons"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={maxPersons}
                        onChange={(e) => setMaxPersons(e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          label="Minimum Block Bookable"
                          type="number"
                          fullWidth
                          margin="normal"
                          value={minBlock}
                          onChange={(e) => setMinBlock(e.target.value)}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          select
                          label="Unit"
                          value={minBlockUnit}
                          onChange={(e) => setMinBlockUnit(e.target.value)}
                          fullWidth
                          margin="normal"
                        >
                          {['Month(s)', 'Week(s)', 'Day(s)', 'Hour(s)'].map((unit) => (
                            <MenuItem key={unit} value={unit}>
                              {unit}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          label="Maximum Block Bookable"
                          type="number"
                          fullWidth
                          margin="normal"
                          value={maxBlock}
                          onChange={(e) => setMaxBlock(e.target.value)}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          select
                          label="Unit"
                          value={maxBlockUnit}
                          onChange={(e) => setMaxBlockUnit(e.target.value)}
                          fullWidth
                          margin="normal"
                        >
                          {['Month(s)', 'Week(s)', 'Day(s)', 'Hour(s)'].map((unit) => (
                            <MenuItem key={unit} value={unit}>
                              {unit}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    <TextField
                      select
                      label="All dates are..."
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      fullWidth
                      margin="normal"
                    >
                      <MenuItem value="available">Available by default</MenuItem>
                      <MenuItem value="non-available">Not available by default</MenuItem>
                    </TextField>
                    <Button variant="contained" color="primary" fullWidth onClick={handleUpdate} style={{ marginTop: "10px" }}>
                      Update
                    </Button>
                </>
              )}
              
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={7}>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer component={Paper} className="p5">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img src={product.images[0]?.src || "https://via.placeholder.com/100"} alt={product.name} width="50" />
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>
                          <Button size="small" color="primary" href={`/product/${product.id}`}>
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default Dashboard;