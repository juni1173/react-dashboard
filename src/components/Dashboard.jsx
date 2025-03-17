import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from './Toast/useToast'; // Adjust the path
import { Container, Switch, Box, Grid, Typography, Button, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Paper, TextField, MenuItem, Card, FormControlLabel, Warning  } from "@mui/material";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import WarningIcon from '@mui/icons-material/Warning';
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Header from "./header";

function List() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
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
  const [minPersons, setMinPersons] = useState(1);
  const [maxPersons, setMaxPersons] = useState(1);
  const [selectedCruise, setSelectedCruise] = useState("");
  const [selectedVessel, setSelectedVessel] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [productFields, setProductFields] = useState({});
   const [dateAvailability, setDateAvailability] = useState(true);
  const [availabilityObject, setAvailabilityObject] = useState([]);
  const [updateDetected, setUpdateDetected] = useState(false);
  
  const { showToast, Toast } = useToast();

  const shouldDisableDate = (date) => {
    return date.isBefore(dayjs().startOf('day'), 'day'); // Disable dates before today
  };
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
        return updatedProductFields;
      });
  };
  const handleToggle = (event) => {
    setDateAvailability(event.target.checked);
  };
  //const userData = JSON.parse(sessionStorage.getItem("userData"));
  // const username = userData?.username;
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: '#1976d2', // Customize primary color
      },
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
        console.warn(response.data);
        const vessels = response.data.filter((category) => category.acf.category_type === "Vessel");
        const cruises = response.data.filter((category) => category.acf.category_type === "Cruise");
        setCategories({cruises, vessels});
        setSelectedDate(dayjs(new Date()).format('YYYY-MM-DD'));
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
  function updateDurationArrayAvailability(durationArray, availabilityObject, date) {

    // console.warn(availabilityObject);
    if (!durationArray || !availabilityObject || !availabilityObject) {
      return durationArray; // Return original array if inputs are invalid
    }
  
    return durationArray.map((durationSlot) => {
      const matchingAvailability = availabilityObject.find((item) => {
        const durationParts = durationSlot.duration.split(" - ");
        return (
          item.from_date === date &&
          item.from === durationParts[0] &&
          item.to === durationParts[1]
        );
      });
  
      if (matchingAvailability) {
        return {
          ...durationSlot,
          availability: matchingAvailability.bookable === "yes",
        };
      } else {
        return {
          ...durationSlot,
          availability: true, // Default to true if no match
        };
      }
    });
  }
  const calculateBookingSlots = (productId, startTime, bookingDuration, bufferTime) => {
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
  
    const finalArr = [];
    let currentSlotStart = startDate;
  
    while (currentSlotStart.getDate() === startDate.getDate()) { // Check if still same day
      const currentSlotEnd = calculateEndTime(currentSlotStart, bookingDuration * 60);
  
      if (currentSlotEnd.getDate() !== startDate.getDate()) {
        break; // Stop if the end time is on next day
      }
  
      finalArr.push({
        duration: `${formatTime(currentSlotStart)} - ${formatTime(currentSlotEnd)}`,
        availability: true,
      });
  
      currentSlotStart = calculateEndTime(currentSlotEnd, bufferTime * 60); // Add buffer
    }
  
    updateDurationArray(productId, finalArr);
    setSlotLoading(false);
    return finalArr;
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
      return availabilityObject || { availability: [] }; // Return existing or empty
    }
  
    // const hasUnavailableSlot = durationArray.some((slot) => !slot.availability);
  
    // if (!hasUnavailableSlot) {
    //   console.warn('2');
    //   return availabilityObject || { availability: [] }; // Return existing or empty
    // }
  
    const newAvailability = durationArray
    
      // .filter((slot) => !slot.availability)
      .map((slot) => ({
        type: 'custom:daterange',
        bookable: slot.availability ? 'yes' : 'no',
        priority: 10,
        from: slot.duration.split(' - ')[0],
        to: slot.duration.split(' - ')[1],
        from_date: selectedDate,
        to_date: selectedDate,
      }));
      const product = productFields[selectedProduct.id];
      const prevProductValues = products.filter((product) => product.id === selectedProduct.id)[0];
    if (!availabilityObject) {
      return { availability: newAvailability };
    }
  
    const updatedAvailability = availabilityObject.map((existingItem) => {
      const matchingNewItem = newAvailability.find(
        (newItem) =>
          newItem.from === existingItem.from &&
          newItem.to === existingItem.to &&
          newItem.from_date === existingItem.from_date
      );
        
      if (matchingNewItem) {
        return { ...existingItem, bookable: matchingNewItem.bookable }; // Update bookable
      }
      return existingItem;
    });
    
    const itemsToAdd = newAvailability.filter(
      (newItem) =>
        !updatedAvailability.some(
          (existingItem) =>
            existingItem.from === newItem.from &&
            existingItem.to === newItem.to &&
            existingItem.from_date === newItem.from_date
        )
    );
          if (prevProductValues.buffer_period !== product.buffer || prevProductValues.duration !== product.durationInput
            || prevProductValues.first_block_time !== product.firstBlockTime) {
              return { availability: [...itemsToAdd] }
            }
    return { availability: [...updatedAvailability, ...itemsToAdd] };
  }
  
  const handleUpdate = async () => {
    const product = productFields[selectedProduct.id];
    const prevProductValues = products.filter((product) => product.id === selectedProduct.id)[0];
    if (!selectedProduct) return;
    console.warn(createAvailabilitySlotObject(product?.durationArray).availability);
  
    setSlotLoading(true);
    
    try {
      const response = await axios.put(
        `https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc-bookings/v1/products/${selectedProduct.id}`,
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
          buffer_period: product?.buffer,
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
          availability: product?.durationUnit?.toLowerCase().replace("(s)", "") === 'day' ? (!dateAvailability ? createAvailabilityDateObject(dateAvailability).availability : []) : createAvailabilitySlotObject(product?.durationArray).availability,
        },
        {
          auth: {
            username: "ck_cb8d0d61726f318ddc43be3407749e7a58360fe1",
            password: "cs_bd55fa6bc205f402e50fdc25876032bb9c45b2ba",
          },
        }
      );
      const updatedData = response.data
      setProductFields((prev) => ({
        ...prev,
        [updatedData.id]: {
          durationType: updatedData.duration_type || "fixed",
          durationUnit: durationUnitMap[updatedData.duration_unit] || "Hour(s)",
          durationInput: updatedData.duration || 1,
          firstBlockTime: updatedData.first_block_time || "",
          minPersons: updatedData.min_persons || 0,
          maxPersons: updatedData.max_persons || 0,
          buffer: updatedData.buffer_period || 0,
          durationArray: [],
        },
      }));
      setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === updatedData.id) {
          return { ...product, ...updatedData };
        }
        return product;
      })
    );

    setFilteredProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === updatedData.id) {
          return { ...product, ...updatedData };
        }
        return product;
      })
    );
       handleDateChange(updatedData, selectedDate);
       setAvailabilityObject(updatedData.availability);
      setSelectedProduct(updatedData);
      if (product?.durationUnit?.toLowerCase().replace("(s)", "") === 'day') {
        showToast('Day availability status updated successfully!', 'success');
      }
      if ((prevProductValues.buffer_period !== product.buffer || prevProductValues.duration !== product.durationInput
        || prevProductValues.first_block_time !== product.firstBlockTime) && updateDetected) {
          setUpdateDetected(false);
          showToast('New slots updated successfully!', 'success');
        } else {
          showToast('Product slots status updated successfully!', 'success');
        }
      
    } catch (error) {
      console.error("Update failed", error.response ? error.response.data : error);
    }

    setSlotLoading(false);
  };
 

const filterProducts = (cruiseId, vesselId, title) => {
  let filtered = products.filter((product) => {
    const categoryIds = product.categories.map((cat) => cat.id);
    const matchesCruise = cruiseId ? categoryIds.includes(parseInt(cruiseId)) : true;
    const matchesVessel = vesselId ? categoryIds.includes(parseInt(vesselId)) : true;
    const matchesTitle = title
      ? product.name.toLowerCase().includes(title.toLowerCase())
      : true;
    return matchesCruise && matchesVessel && matchesTitle;
  });
  setFilteredProducts(filtered);
};

// Handle change for cruise dropdown
const handleCruiseChange = (event) => {
  const cruiseId = event.target.value;
  setSelectedCruise(cruiseId);
  filterProducts(cruiseId, selectedVessel || null, searchTitle);
};

// Handle change for vessel dropdown
const handleVesselChange = (event) => {
  const vesselId = event.target.value;
  setSelectedVessel(vesselId);
  filterProducts(selectedCruise || null, vesselId, searchTitle);
};
const handleTitleChange = (event) => {
  const title = event.target.value;
  setSearchTitle(title);
  filterProducts(selectedCruise, selectedVessel, title);
};
const durationUnitMap = {
  month: "Month(s)",
  day: "Day(s)",
  hour: "Hour(s)",
  minute: "Minute(s)",
};
const handleDateChange = (product, date) => {
  const availabilityObj = product.availability;
  if (product.duration_unit === 'day') {
    return availabilityObj.map((item) => {
      (item.from_date === date && item.to_date === date && item.from === '00:00' && item.to === '24:00') ? (item.bookable === 'no' ? setDateAvailability(false) : setDateAvailability(true)) : setDateAvailability(true);
    });
  } else {
    updateDurationArray(product.id, updateDurationArrayAvailability(calculateBookingSlots(product.id, product.first_block_time, product.duration, product.buffer_period), availabilityObj, date));
  }
  
}
const handleAccordionChange = (product) => (event, isExpanded) => {
    setSelectedProduct(product);
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
    handleDateChange(product, selectedDate);
    setAvailabilityObject(product.availability);
  }
};

const handleInputChange = (product, field, value) => {
  const productId = product.id;
  let updateStatus = true;
  const prevProductData = products.filter((pro) => pro.id === productId)[0];
  if (field === "firstBlockTime" || field === "durationInput" || field === "buffer") {
    if (field === "buffer" && prevProductData.buffer_period === Number(value) &&
    prevProductData.duration === Number(productFields[productId].durationInput) &&
    prevProductData.first_block_time === productFields[productId].firstBlockTime
     ) {
      updateStatus = false;
    }
    if (field === "durationInput" && prevProductData.buffer_period === Number(productFields[productId].buffer) &&
    prevProductData.duration === Number(value) &&
    prevProductData.first_block_time === productFields[productId].firstBlockTime) {
      updateStatus = false;
    }
    if (field === "firstBlockTime" && prevProductData.buffer_period === Number(productFields[productId].buffer) &&
    prevProductData.duration === Number(productFields[productId].durationInput) &&
    prevProductData.first_block_time === value) {

      updateStatus = false;
    }
  }
  setUpdateDetected(updateStatus);
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
  
      if (field === "firstBlockTime" || field === "durationInput" || field === "buffer") {
        
        if (startTime !== "" && bookingDuration !== "" && bufferTime !== "") {
          calculateBookingSlots(productId, startTime, parseInt(bookingDuration), parseInt(bufferTime));
        } else {
          console.warn("One or more fields are empty. Calculation skipped.");
        }
      }
     
    } else {
      console.warn(`productId ${productId} not found in productFields.`);
    }
    
  };
 const dateUpdateFunction = date => {
    setSelectedDate(date);
    handleDateChange(selectedProduct, date);
  }
  
  return (
    <ThemeProvider theme={darkTheme}>
      <Container mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={12}>
          <Header />
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
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
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
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
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
              <TextField
                  label="Search by Title"
                  value={searchTitle}
                  onChange={handleTitleChange}
                  fullWidth
                  margin="normal"
                />
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
                      onChange={(e) => handleInputChange(product, "durationType", e.target.value)}
                      fullWidth
                      margin="normal"
                      disabled
                    >
                      <MenuItem value="fixed">Fixed</MenuItem>
                      <MenuItem value="flexible">Flexible</MenuItem>
                    </TextField>

                    {/* Duration Unit */}
                    <TextField
                      select
                      label="Duration Unit"
                      value={productFields[product.id]?.durationUnit || ""}
                    onChange={(e) => handleInputChange(product, "durationUnit", e.target.value)}
                      fullWidth
                      margin="normal"
                      disabled
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
                    onChange={(e) => handleInputChange(product, "durationInput", e.target.value)}
                      fullWidth
                      margin="normal"
                      inputProps={{ min: 1 }}
                      disabled={productFields[product.id]?.durationUnit?.toLowerCase().replace("(s)", "") === 'day'}
                    />
                  </Box>
                  {productFields[product.id]?.durationUnit === 'Hour(s)' && (
                    <Box display="flex" gap={2} mt={2}>
                      <TextField
                          label="First Block Time"
                          type="time"
                          value={productFields[product.id]?.firstBlockTime || ""}
                          onChange={(e) => handleInputChange(product, "firstBlockTime", e.target.value)}
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
                          onChange={(e) => handleInputChange(product, "buffer", e.target.value)}
                          inputProps={{ min: 1 }}
                          sx={{
                            '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button':
                              {
                                '-webkit-appearance': 'none',
                                margin: 0,
                              },
                            '& input[type=number]': {
                              '-moz-appearance': 'textfield',
                            },
                          }}
                        />
                      </Box>
                  )}
                      
                </Box>
                <Box>
                <Card>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <StaticDatePicker
                        displayStaticWrapperAs="desktop"
                        value={selectedDate}
                        onChange={(newDate) => dateUpdateFunction(dayjs(newDate).format('YYYY-MM-DD'))}
                        shouldDisableDate={shouldDisableDate}
                        />
                    </LocalizationProvider>
                  
                </Card>
                </Box>
                <Box display="flex" flexDirection="row" justify-content="center" alignItems="center"  gap={2} flexWrap="wrap" mt={2}>
                 {slotLoading ? (
                    <CircularProgress />
                  ) : (
                    updateDetected ? (
                      <Box display="flex" alignItems="center" color="error.main">
                        <WarningIcon sx={{ mr: 1 }} />
                        <Typography>
                          Duration, Start Time or Buffer change detected click update button to delete previous slots and generate new
                          slots...
                        </Typography>
                      </Box>
                    ) : (
                      productFields[product.id]?.durationArray?.map((slot, index) => (
                        <Card key={index} sx={{ p: 2, minWidth: 300, maxHeight: 30, textAlign: 'center', position: 'relative' }}>
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
                        <Typography style={{ marginTop: "20px", fontSize: 'larger', letterSpacing:'2px', fontWeight:'700' }} variant="body1">{slot.duration}</Typography>
                      </Card>
                    ))
                    )
                    
                  )}
                  {product.duration_unit === 'day' && (
                    <>
                    <Typography>
                    Availability on <br />
                      {selectedDate}
                    </Typography>
                      <FormControlLabel
                          style={{maxHeight: "30px", textAlign: "center"}}
                          control={<Switch checked={dateAvailability} onChange={handleToggle} />}
                          label={dateAvailability ? 'Bookable' : 'Not Bookable'} // Optional: change label dynamically
                          />
                      </>
                  )}
                  <Toast />
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
               <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdate}
                    sx={{
                      padding: '12px 24px', // Adjust padding for a bigger button
                      fontSize: '1rem', // Adjust font size if needed
                    }}
                  >
                    Update
                  </Button>
                </Box>
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