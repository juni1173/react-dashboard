import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Switch, Box, Grid, Typography, Button, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Paper, TextField, MenuItem, Card, FormControlLabel, Checkbox  } from "@mui/material";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function List() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [duration, setDuration] = useState("");
  const [cruiseOptions, setCruiseOptions] = useState({
    multipleDays: false,
    dayCruise: false,
    sunsetCruise: false,
  });
//   const [minBlock, setMinBlock] = useState(0);
//   const [minBlockUnit, setMinBlockUnit] = useState("Day(s)");
//   const [maxBlock, setMaxBlock] = useState(0);
//   const [maxBlockUnit, setMaxBlockUnit] = useState("Month(s)");
//   const [availability, setAvailability] = useState("available");
  const [minPersons, setMinPersons] = useState(1);
  const [maxPersons, setMaxPersons] = useState(1);
  const [selectedCruise, setSelectedCruise] = useState("");
  const [selectedVessel, setSelectedVessel] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [productFields, setProductFields] = useState({});
  const [dateAvailability, setDateAvailability] = useState(true);

  const handleSlotToggle = (event, slot, product) => {
    const status = event.target.checked;
    setProductFields((prev) => {
        const updatedProductFields = { ...prev };
        const productDurations = updatedProductFields[product]?.durationArray;
    
        if (productDurations && Array.isArray(productDurations)) {
          const updatedDurations = productDurations.map((durationSlot) => {
            if (durationSlot.duration === slot.duration) {
              return { ...durationSlot, availability: status };
            }
            return durationSlot;
          });
    
          if (updatedProductFields[product]) {
            updatedProductFields[product].durationArray = updatedDurations;
          }
        }
    
        console.warn(updatedProductFields);
        return updatedProductFields;
      });
    // let availabilityArray = [];
  
    // if (slotDuration && Array.isArray(slotDuration)) {
    //   slotDuration.forEach((slot) => {
    //     const [fromTime, toTime] = slot.split(' - ');
    //     if (fromTime && toTime) {
    //       availabilityArray.push({
    //         type: 'custom',
    //         bookable: status ? 'yes' : 'no',
    //         priority: 10,
    //         from: fromTime,
    //         to: toTime,
    //         date: date, // Add date to each object
    //       });
    //     }
    //   });
    // }
  
    // const duration = { availability: availabilityArray };
    // setSlotAvailable(status);
    // setSlotObject(duration);
    // console.warn(duration);
  };
  const handleToggle = (event) => {
    setDateAvailability(event.target.checked);
  };
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
    const fetchCategories = async () => {
      try {
        // const response = await axios.get("https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc/v3/products?per_page=50", {
        const response = await axios.get("https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc-bookings/v1/products/categories?per_page=20", {
          auth: {
            username: "ck_cb8d0d61726f318ddc43be3407749e7a58360fe1",
            password: "cs_bd55fa6bc205f402e50fdc25876032bb9c45b2ba",
          },
        });
        const vessels = response.data.filter((category) => category.acf.category_type === "Vessel");
        const cruises = response.data.filter((category) => category.acf.category_type === "Cruise");
        console.warn({cruises, vessels});
        setCategories({cruises, vessels});
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
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
        setProducts(activeProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const updateDurationArray = (productId, durations) => {
    setSlotLoading(true);
    setProductFields((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        durationArray: durations, // Store per-product durations
      },
    }));
    setSlotLoading(false);
  };
 
  const calculateBookingSlots = (productId, startTime, bookingDuration, bufferTime) => {
    console.warn(productId, startTime, bookingDuration, bufferTime);
    setSlotLoading(true);
  
    if (!startTime) {
      updateDurationArray(productId, ["Slot required Start Time"]);
      setSlotLoading(false);
      return;
    }
    if (!bookingDuration) {
      updateDurationArray(productId, ["Slot required Booking Duration"]);
      setSlotLoading(false);
      return;
    }
    if (!bufferTime) {
      updateDurationArray(productId, ["Slot required Buffer Time"]);
      setSlotLoading(false);
      return;
    }
  
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);
  
    const calculateEndTime = (date, duration) => {
      const endDate = new Date(date.getTime());
      endDate.setMinutes(endDate.getMinutes() + duration);
      return endDate;
    };
   
    const formatTime = (date) => {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };
  
    const firstSlotEnd = calculateEndTime(startDate, bookingDuration * 60);
    const secondSlotStart = calculateEndTime(firstSlotEnd, bufferTime * 60); //buffer is added here
    const secondSlotEnd = calculateEndTime(secondSlotStart, bookingDuration * 60);
  
    updateDurationArray(productId, [
      {duration: `${formatTime(startDate)} - ${formatTime(firstSlotEnd)}`, availability: true},
      {duration: `${formatTime(secondSlotStart)} - ${formatTime(secondSlotEnd)}`, availability: true},
    ]);
  
    // console.warn(productFields);
    setSlotLoading(false);
  };
  function convertSlotsToString(slots) {
    if (!slots || slots.length === 0) {
      return "";
    }
  
    const availableSlots = slots
      .filter((slot) => slot.availability)
      .map((slot) => slot.duration);
  
    return availableSlots.join(" or ");
  }
  function createAvailabilityDateObject(date_availability) {
    if (date_availability) {
      return { availability: [] };
    }
  
    const availability = [{
        type: 'custom:daterange',
        bookable: date_availability ? 'yes' : 'no', // All are "no" based on your example
        priority: 10,
        from: '00:00',
        to: '24:00',
        from_date: selectedDate,
        to_date: selectedDate,
      }];
  
    return { availability };
  }
  function createAvailabilitySlotObject(durationArray) {
    if (!durationArray || durationArray.length === 0) {
      return { availability: [] };
    }
  
    const hasUnavailableSlot = durationArray.some((slot) => !slot.availability);
  
    if (!hasUnavailableSlot) {
      return { availability: [] };
    }
  
    const availability = durationArray
      .filter((slot) => !slot.availability) // Filter only unavailable slots (availability: false)
      .map((slot) => ({
        type: 'custom:daterange',
        bookable: 'no', // All are "no" based on your example
        priority: 10,
        from: slot.duration.split(' - ')[0],
        to: slot.duration.split(' - ')[1],
        from_date: selectedDate,
        to_date: selectedDate,
      }));
  
    return { availability };
  }
 const handleUpdate = async () => {
    const product = productFields[selectedProduct];
  
    if (!selectedProduct) return;
    // setFormLoading(true);
    

    try {
      await axios.put(
        `https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc-bookings/v1/products/${selectedProduct}`,
        {
          acf: {
            cruise_duration: convertSlotsToString(product?.durationArray)|| [], // ACF field for duration
            // multiple_days_cruise: cruiseOptions.multipleDays,
            // day_cruise: cruiseOptions.dayCruise,
            // sunset_cruise: cruiseOptions.sunsetCruise,
          },
          meta_data: [
            {
              key: "cruise_duration",
              value: convertSlotsToString(product?.durationArray)|| [],
            },
          ],
          first_block_time: product?.firstBlockTime,
        //   min_block: minBlock,
        //   min_block_unit: minBlockUnit.toLowerCase().replace("(s)", ""),
        //   max_block: maxBlock,
        //   max_block_unit: maxBlockUnit.toLowerCase().replace("(s)", ""),
        //   default_date_availability: availability === "non-available" ? "" : availability,
          min_persons: minPersons,
          max_persons: maxPersons,
          duration_type: product?.durationType,
          duration_unit: product?.durationUnit?.toLowerCase().replace("(s)", ""),
          duration: product?.durationInput,
          availability: !dateAvailability ? createAvailabilityDateObject(dateAvailability).availability : createAvailabilitySlotObject(product?.durationArray).availability,
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

    // setFormLoading(false);
  };

const filterProducts = (cruiseId, vesselId) => {
  let filtered = products.filter((product) => {
    const categoryIds = product.categories.map((cat) => cat.id);
    const matchesCruise = cruiseId ? categoryIds.includes(parseInt(cruiseId)) : true;
    const matchesVessel = vesselId ? categoryIds.includes(parseInt(vesselId)) : true;
    return matchesCruise && matchesVessel;
  });
  setFilteredProducts(filtered);
};

// Handle change for cruise dropdown
const handleCruiseChange = (event) => {
  const cruiseId = event.target.value;
  setSelectedVessel(null);
  setSelectedCruise(cruiseId);
  filterProducts(cruiseId, null);
};

// Handle change for vessel dropdown
const handleVesselChange = (event) => {
  const vesselId = event.target.value;
  setSelectedCruise(null);
  setSelectedVessel(vesselId);
  filterProducts(null, vesselId);
};
const durationUnitMap = {
  month: "Month(s)",
  day: "Day(s)",
  hour: "Hour(s)",
  minute: "Minute(s)",
};
const handleAccordionChange = (product) => (event, isExpanded) => {
    setSelectedProduct(product.id);
  if (isExpanded) {
    setProductFields((prev) => ({
      ...prev,
      [product.id]: {
        durationType: product.duration_type || "fixed",
        durationUnit: durationUnitMap[product.duration_unit] || "Hour(s)",
        durationInput: product.duration || 1,
        firstBlockTime: product.first_block_time || "",
        minPersons: product.min_persons || 0,
        maxPersons: product.max_persons || 0,
        buffer: product.buffer_period || 0,
        durationArray: [],
      },
    }));
    calculateBookingSlots(product.id, product.first_block_time, product.duration, product.buffer_period);
  }
};

const handleInputChange = (productId, field, value) => {
    setProductFields((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  
    const updatedFields = {
      ...productFields,
      [productId]: {
        ...productFields[productId],
        [field]: value,
      },
    };
  
    // Check if productFields[productId] exists before accessing its properties
    if (productFields[productId]) {
      const startTime = field === "firstBlockTime"
        ? value
        : updatedFields[productId]?.firstBlockTime || "00:00";
  
      const bookingDuration = field === "durationInput"
        ? value
        : updatedFields[productId]?.durationInput !== undefined && updatedFields[productId]?.durationInput !== ""
          ? updatedFields[productId]?.durationInput
          : "1";
  
      const bufferTime = field === "buffer"
        ? value
        : updatedFields[productId]?.buffer !== undefined && updatedFields[productId]?.buffer !== ""
          ? updatedFields[productId]?.buffer
          : "0";
  
      console.log("Field:", field);
      console.warn(productId, startTime, bookingDuration, bufferTime);
  
      if (field === "firstBlockTime" || field === "durationInput" || field === "buffer") {
        if (startTime !== "" && bookingDuration !== "" && bufferTime !== "") {
          console.warn(productId, startTime, bookingDuration, bufferTime);
          calculateBookingSlots(productId, startTime, parseInt(bookingDuration), parseInt(bufferTime));
        } else {
          console.warn("One or more fields are empty. Calculation skipped.");
        }
      }
    } else {
      console.warn(`productId ${productId} not found in productFields.`);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={12}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
              {/* Dropdown for Cruises */}
              <Card style={{ backgroundColor: "#121212", padding: "20px", textAlign: "center" }}>
              <Box display="flex" gap={2}>
              <TextField
                select
                label="Select Cruise"
                value={selectedCruise}
                onChange={handleCruiseChange}
                fullWidth
                margin="normal"
              >
                {categories.cruises.length > 0 ? (
                  categories.cruises.map((cruise) => (
                    <MenuItem key={cruise.id} value={cruise.id}>
                      {cruise.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No Cruises Available</MenuItem>
                )}
              </TextField>
    
              {/* Dropdown for Vessels */}
              <TextField
                select
                label="Select Vessel"
                value={selectedVessel}
                onChange={handleVesselChange}
                fullWidth
                margin="normal"
              >
                {categories.vessels.length > 0 ? (
                  categories.vessels.map((vessel) => (
                    <MenuItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No Vessels Available</MenuItem>
                )}
              </TextField>
              </Box>
              </Card>
              <Box>
      {filteredProducts.map((product) => (
        <Accordion style={{marginTop: "5px", marginBottom: "5px"}} key={product.id} onChange={handleAccordionChange(product)}>
          {/* Tab Header (Expandable Section) */}
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={2}>
              <img src={product.images[0]?.src || "https://via.placeholder.com/50"} alt={product.name} width="50" />
              <Typography variant="h7">{product.name}</Typography>
              <Typography variant="body1" color="primary">
                {product.duration_type} - {product.duration} {product.duration_unit}
              </Typography>
            </Box>
          </AccordionSummary>

          {/* Tab Details (Expanded Content) */}
          <AccordionDetails>
            <Paper elevation={3} sx={{ p: 2}}>
              {/* <Typography variant="body2">More details about the product can go here.</Typography> */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Booking Duration
                  </Typography>
                  <Box display="flex" gap={2}>
                    {/* Duration Type */}
                    <TextField
                      select
                      label="Duration Type"
                      value={productFields[product.id]?.durationType || ""}
                      onChange={(e) => handleInputChange(product.id, "durationType", e.target.value)}
                      fullWidth
                      margin="normal"
                    >
                      <MenuItem value="fixed">Fixed</MenuItem>
                      <MenuItem value="flexible">Flexible</MenuItem>
                    </TextField>

                    {/* Duration Unit */}
                    <TextField
                      select
                      label="Duration Unit"
                      value={productFields[product.id]?.durationUnit || ""}
                    onChange={(e) => handleInputChange(product.id, "durationUnit", e.target.value)}
                      fullWidth
                      margin="normal"
                    >
                      {['Month(s)', 'Day(s)', 'Hour(s)', 'Minute(s)'].map((unit) => (
                            <MenuItem key={unit} value={unit}>
                              {unit}
                            </MenuItem>
                          ))}
                    </TextField>

                    {/* Duration */}
                    <TextField
                      label="Duration"
                      type="number"
                      value={productFields[product.id]?.durationInput || ""}
                    onChange={(e) => handleInputChange(product.id, "durationInput", e.target.value)}
                      fullWidth
                      margin="normal"
                      inputProps={{ min: 1 }}
                    />
                  </Box>
                      <Box display="flex" gap={2} mt={2}>
                      <TextField
                          label="First Block Time"
                          type="time"
                          value={productFields[product.id]?.firstBlockTime || ""}
                          onChange={(e) => handleInputChange(product.id, "firstBlockTime", e.target.value)}
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                        label="Buffer"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={productFields[product.id]?.buffer || ""}
                        onChange={(e) => handleInputChange(product.id, "buffer", e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                      </Box>
                </Box>
                <Box>
                <Card>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <StaticDatePicker
                        displayStaticWrapperAs="desktop"
                        value={selectedDate}
                        onChange={(newDate) => setSelectedDate(dayjs(newDate).format('YYYY-MM-DD'))}
                        />
                    </LocalizationProvider>
                </Card>
                </Box>
                <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                 {slotLoading ? (
                    <CircularProgress />
                  ) : (
                    productFields[product.id]?.durationArray?.map((slot, index) => (
                        <Card key={index} sx={{ p: 2, minWidth: 150, maxHeight: 30, textAlign: 'center', position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                            {(slot !== "Slot required Start Time" || slot !== "Slot required Booking Duration" || slot !== "Slot required Buffer Time") && (
                                <FormControlLabel
                                control={<Switch checked={slot.availability} onChange={e => handleSlotToggle(e, slot, product.id)} size="small" />}
                                label={slot.availability ? 'Bookable' : 'Not Bookable'}
                                labelPlacement="start"
                                sx={{
                                  margin: 0,
                                  '& .MuiTypography-root': {
                                    fontSize: '0.75rem', // Adjust the font size as needed
                                  },
                                }}
                              />
                            )}
                        </Box>
                        <Typography style={{ marginTop: "20px" }} variant="body1">{slot.duration}</Typography>
                      </Card>
                    ))
                  )}
                  <Typography>
                  Availability on <br />
                    {selectedDate}
                  </Typography>
                <FormControlLabel
                    style={{maxHeight: "30px", textAlign: "center"}}
                    control={<Switch checked={dateAvailability} onChange={handleToggle} />}
                    label={dateAvailability ? 'Not Bookable' : 'Bookable'} // Optional: change label dynamically
                    />
                </Box>
                
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        label="Min Persons"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={productFields[product.id]?.minPersons || ""}
                        onChange={(e) => handleInputChange(product.id, "minPersons", e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max Persons"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={productFields[product.id]?.maxPersons || ""}
                          onChange={(e) => handleInputChange(product.id, "maxPersons", e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>

              {/* <Button variant="contained" color="primary" href={`/product/${product.id}`} sx={{ mt: 2 }}>
                View Details
              </Button> */}
              <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mt: 2 }}>
                Update
              </Button>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default List;