import React, { useState } from "react";
import {
    Table,
    TableBody,
    Box,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@mui/material";
import axios from "axios";
import { useToast } from '../../Toast/useToast';
const Board = ({ orders, loading, callback }) => {
    const [open, setOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { showToast, Toast } = useToast();
    const [cancelLoading, setCancelLoading] = useState(false);

    const handleCancel = (order) => {
        setSelectedOrder(order);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedOrder(null);
    };
    const cancelOrderApi = async (id) => {
        setCancelLoading(true);
        try {
            // Fetch order first to verify existence
            const orderResponse = await axios.get(
                `https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc/v3/orders/${id}`,
                {
                    auth: {
                        username: "ck_1f464ec8689a73082203c109dcad8e6e1a691631",
                        password: "cs_3072b928305675012278342ea5b99412646153a6",
                    },
                }
            );
    
            if (!orderResponse.data) {
                showToast(`Order #${id} not found`, 'error');
                setCancelLoading(false);
                return;
            }
    
            // Now cancel order
            const response = await axios.put(
                `https://cretaluxurycruises.dev6.inglelandi.com/wp-json/wc/v3/orders/${id}`,
                { status: "cancelled" },
                {
                    auth: {
                        username: "ck_1f464ec8689a73082203c109dcad8e6e1a691631",
                        password: "cs_3072b928305675012278342ea5b99412646153a6",
                    },
                }
            );
    
            if (response.status === 200) {
                showToast(`Order #${id} cancelled successfully`, 'success');
                setCancelLoading(false);
                callback(); // Refresh orders
            }
        } catch (error) {
            showToast(`Error cancelling order #${id}`, 'error');
            setCancelLoading(false);
            console.error("Error cancelling order:", error.response?.data || error);
        }
    };
    
    
    const handleConfirm = async () => {
        if (selectedOrder) {
            await cancelOrderApi(selectedOrder.order_id);
            setOpen(false);
            setSelectedOrder(null);
        }
    };

    return (
        <>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Name</b></TableCell>
                                <TableCell><b>Product</b></TableCell>
                                <TableCell><b>Order Status</b></TableCell>
                                <TableCell><b>Booking Start</b></TableCell>
                                <TableCell><b>Booking End</b></TableCell>
                                <TableCell><b>Deposit ($)</b></TableCell>
                                <TableCell><b>Remaining ($)</b></TableCell>
                                <TableCell><b>Total ($)</b></TableCell>
                                <TableCell><b>Action</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.order_id} - {order.name} {order.surname}</TableCell>
                                        <TableCell>{order.product_name}</TableCell>
                                        <TableCell>{order.order_status}</TableCell>
                                        <TableCell>{order.booking_start_datetime}</TableCell>
                                        <TableCell>{order.booking_end_datetime}</TableCell>
                                        <TableCell>${order.deposit}</TableCell>
                                        <TableCell>${order.remaining}</TableCell>
                                        <TableCell>${order.total}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="error" onClick={() => handleCancel(order)}>
                                                Cancel
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">No orders found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogContent>
                    {selectedOrder ? `Do you really want to cancel order #${selectedOrder.order_id}?` : "Are you sure you want to proceed?"}
                </DialogContent>
                <DialogActions>
                    {cancelLoading ? (
                        <div style={{textAlign: 'center'}}><CircularProgress/></div>
                    ) : (
                        <>
                            <Button onClick={handleClose} color="primary">No</Button>
                            <Button onClick={handleConfirm} color="error">Yes</Button>
                        </>
                    )}
                    
                </DialogActions>
            </Dialog>
            <Toast />
        </>
    );
};

export default Board;
