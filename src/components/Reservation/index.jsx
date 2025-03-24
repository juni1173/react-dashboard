import React, { useState, useEffect } from 'react';
import Board from './Components/board';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Container, Box, Card, Typography, CircularProgress } from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';
const Index = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [ordersData, setOrdersData] = useState([]);
    // const [dateBasedOrders, setDateBasedOrders] = useState([]);
    const [loading, setLoading] = useState(false);

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
            const ordersResponse = await axios.get(`${apiUrl}/custom-api/v1/orders-by-date?date=${selectedDate}`, {
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

    useEffect(() => {
        getOrders();
        // dateUpdateFunction(selectedDate);
    }, [selectedDate]);

    return (
        <ThemeProvider theme={darkTheme}>
            <Container>
                <Box>
                    <Card>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <StaticDatePicker   
                                displayStaticWrapperAs="desktop"
                                value={dayjs(selectedDate)}
                                onChange={(newDate) => setSelectedDate(dayjs(newDate).format('YYYY-MM-DD'))}
                            />
                        </LocalizationProvider>
                    </Card>
                </Box>
                
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <div style={{textAlign:'center'}}><CircularProgress /></div>
                    </Box>
                ) : ordersData.length > 0 ? (
                    <Board orders={ordersData} selectedDate={selectedDate} loading={loading} callback={getOrders}/>
                ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" color="error.main" minHeight="200px">
                        <WarningIcon sx={{ mr: 1 }} />
                        <Typography>No orders found on {selectedDate}</Typography>
                    </Box>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default Index;
