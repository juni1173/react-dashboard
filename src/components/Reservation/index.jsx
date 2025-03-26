import React, { useState, useEffect } from 'react';
import Board from './Components/board';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Container, Box, Card, Typography, CircularProgress, Button, Grid, TextField, MenuItem } from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';
import Header from "../header";
const Index = () => {
    const [searchType, setSearchType] = useState('date');
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
    const [ordersData, setOrdersData] = useState([]);
    const [dateRange, setDateRange] = useState({ from: null, to: null });
    // const [dateBasedOrders, setDateBasedOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleMonthChange = (event) => {
        const monthIndex = Number(event.target.value); // Month index (1-12)
        setSelectedMonth(event.target.value);

        // Get first and last date of the selected month in YYYY-MM-DD format
        const year = dayjs().year(); // Current year
        const firstDay = dayjs(`${year}-${monthIndex}-01`).format("YYYY-MM-DD");
        const lastDay = dayjs(`${year}-${monthIndex}-01`).endOf("month").format("YYYY-MM-DD");

        updateSearch(firstDay, lastDay, 'month');
    };

    const darkTheme = createTheme({
        palette: {
            mode: "dark",
            primary: {
                main: '#1976d2',
            },
        },
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: { padding: "6px" },
                },
            },
        },
    });
    // const dateUpdateFunction = (date) => {
    //     setSelectedDate(date);
    //     // if (!ordersData.length) return;

    //     // setLoading(true);
    //     // console.warn(ordersData);
    //     // console.warn(dayjs(date).startOf('day').unix());
    // //     const filteredOrders = ordersData
    // //     .map(order => ({
    // //         ...order,
    // //         bookings: order.bookings.filter(booking => {
    // //             if (!booking.start) return false; // Skip invalid bookings

    // //             // Ensure booking.start is a number before comparing
    // //             const bookingStartUnix = Number(booking.start);
    // //             console.warn(bookingStartUnix);
    // //             // Check if booking start falls within the selected date range
    // //             return bookingStartUnix === dayjs(date).startOf('day').unix();
    // //         })
    // //     }))
    // //     .filter(order => order.bookings.length > 0); // Keep only orders with matching bookings

    // // setDateBasedOrders(filteredOrders);
    //     // setLoading(false);
    // };
    

    async function getOrders() {
        setLoading(true);
        
        const apiUrl = "https://cretaluxurycruises.dev6.inglelandi.com/wp-json";
        // const consumerKey = "ck_03d27400c81ef458ab5279b224dbbde6eed2183a";
        // const consumerSecret = "cs_1880efab3ccd7cb799c413e288c711a100db07eb";

        try {
            const ordersResponse = await axios.get(`${apiUrl}/custom-api/v1/orders-by-date`, {
            params: { from: dateRange.from, to: dateRange.to },
          auth: {
            username: "khawajakhalil3@gmail.com",
            password: "PbL5 PWF0 dadi o9Ea 6IsW heL5",
          },
        });
            const data = await ordersResponse.data;
            
            // return false;
            console.warn(data);
            if (ordersResponse.status === 200) {
                setOrdersData(data.orders);
            } else {
                setOrdersData([]);
            }
            
            setLoading(false);
            
        } catch (error) {
            setOrdersData([]);
            console.error("Error fetching orders:", error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }
const updateSearch = (from, to, type) => {
    setSearchType(type);
    console.warn(from, to, type);
    if (type === 'date') {
        setSelectedDate(from);
    }
    if (type === 'range') {
        setSelectedDate(dayjs());
    }
    setDateRange({from, to});
    console.warn(searchType, dateRange);

}
const typeChange = (type) => {
    setSearchType(type);
    setDateRange({from: null, to: null});
    setSelectedDate(dayjs())
}
    useEffect(() => {
        getOrders();
        // dateUpdateFunction(selectedDate);
    }, [dateRange]);

    return (
        <ThemeProvider theme={darkTheme}>
            <Container>
            <Header />
            {/* Buttons for Search Options */}
                <Box display="flex" justifyContent="center" gap={2} my={2}>
                <Button
                    variant={searchType === "date" ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => typeChange('date')}
                    sx={{ borderRadius: "20px", px: 3 }}
                >
                    Search by Date
                </Button>
                <Button
                    variant={searchType === "month" ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => typeChange("month")}
                    sx={{ borderRadius: "20px", px: 3 }}
                >
                    Search by Month
                </Button>
                <Button
                    variant={searchType === "range" ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => typeChange("range")}
                    sx={{ borderRadius: "20px", px: 3 }}
                >
                    Search by Date Range
                </Button>
                </Box>
                <Box>
                    <Card>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {searchType === "date" && (
                            <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            value={selectedDate}
                            onChange={(newDate) => updateSearch(dayjs(newDate).format('YYYY-MM-DD'), dayjs(newDate).format('YYYY-MM-DD'), 'date')}
                            />
                        )}
                        {searchType === "range" && (
                            <>
                            <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                label="From"
                                value={dateRange.from}
                                onChange={(newDate) => setDateRange({ ...dateRange, from: dayjs(newDate).format('YYYY-MM-DD') })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                value={dateRange.to}
                                onChange={(newDate) => setDateRange({ ...dateRange, to: dayjs(newDate).format('YYYY-MM-DD') })}
                              />
                            </Grid>
                          </Grid>
                          <Grid item xs={12} style={{textAlign: 'center'}}>
                            <Button  onClick={() => updateSearch(dateRange.from, dateRange.to, 'range')}>Search Bookings</Button>
                          </Grid>
                          
                          </>
                        )}
                        {searchType === 'month' && (
                             <Box 
                             display="flex" 
                             justifyContent="center" 
                             alignItems="center" 
                         >
                             <TextField
                                 select
                                 label="Select Month"
                                 value={selectedMonth}
                                 onChange={handleMonthChange}
                                 margin="normal"
                                 sx={{
                                     width: "30%", // Set width to 30%
                                     minWidth: "200px", // Prevent it from being too small on smaller screens
                                 }}
                             >
                                 <MenuItem value="">
                                     <em>None</em>
                                 </MenuItem>
                                 {months.map((month, index) => (
                                     <MenuItem key={index + 1} value={index + 1}>
                                         {month}
                                     </MenuItem>
                                 ))}
                             </TextField>
                         </Box>
                        )}
                        </LocalizationProvider>

                    </Card>
                </Box>
                
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <div style={{textAlign:'center'}}><CircularProgress /></div>
                    </Box>
                ) : ordersData.length > 0 ? (
                    <Board orders={ordersData} selectedDate={selectedDate} range={dateRange} loading={loading} callback={getOrders}/>
                ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" color="error.main" minHeight="200px">
                        <WarningIcon sx={{ mr: 1 }} />
                        {searchType ? (
                            <Typography>No orders found {searchType === 'date' ? `on ${selectedDate ? selectedDate : 'no date selected'}` : `from ${dateRange.from ? dateRange.from : 'not selected'} to ${dateRange.to ? dateRange.to : 'not selected'}`}</Typography>
                        ) : (
                            <Typography>No filter applied!</Typography>
                        )}
                        
                    </Box>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default Index;
