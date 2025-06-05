import React, { useState } from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import {
  Box,
  Card,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
} from "@mui/material";

const BulkUpdate = ({
  productFields,
  updateDetected,
  selectedProduct,
  setProductFields,
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const shouldDisableDate = (date) => {
    return date.isBefore(dayjs().startOf("day"), "day");
  };

  const handleSlotToggle = (event, slot, product) => {
    const status = event.target.checked;
    setProductFields((prev) => {
      const updatedProductFields = { ...prev };
      const productDurations = updatedProductFields[product]?.durationArray;

      if (Array.isArray(productDurations)) {
        const updatedDurations = productDurations.map((durationSlot) =>
          durationSlot.duration === slot.duration
            ? { ...durationSlot, availability: status }
            : durationSlot
        );
        updatedProductFields[product].durationArray = updatedDurations;
      }

      return updatedProductFields;
    });
  };

  const isSlotPlaceholder = (slot) =>
    [
      "Slot required Start Time",
      "Slot required Booking Duration",
      "Slot required Buffer Time",
    ].includes(slot);

  return (
    <>
      <Box mb={2}>
        <Card sx={{ p: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  shouldDisableDate={shouldDisableDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth variant="outlined" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  shouldDisableDate={shouldDisableDate}
                  minDate={startDate || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth variant="outlined" />
                  )}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Card>
      </Box>

      {updateDetected ? (
        <Typography sx={{ mt: 2 }}>
          Duration, Start Time or Buffer change detected — update to generate
          new slots...
        </Typography>
      ) : (
        productFields[selectedProduct?.id]?.durationArray?.map(
          (slot, index) => (
            <Card
              key={index}
              sx={{
                p: 2,
                minWidth: 300,
                mb: 2,
                textAlign: "center",
                position: "relative",
              }}
            >
              {!isSlotPlaceholder(slot.duration) && (
                <Box sx={{ position: "absolute", top: 5, right: 5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={slot.availability}
                        onChange={(e) =>
                          handleSlotToggle(e, slot, selectedProduct.id)
                        }
                        size="small"
                      />
                    }
                    label={slot.availability ? "Bookable" : "Not Bookable"}
                    labelPlacement="start"
                    sx={{
                      margin: 0,
                      "& .MuiTypography-root": {
                        fontSize: "0.75rem",
                      },
                    }}
                  />
                </Box>
              )}
              <Typography
                sx={{
                  mt: 2,
                  fontSize: "larger",
                  letterSpacing: "2px",
                  fontWeight: 700,
                }}
                variant="body1"
              >
                {slot.duration}
              </Typography>
            </Card>
          )
        )
      )}
    </>
  );
};

export default BulkUpdate;
