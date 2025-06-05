import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CircularProgress, Card, CardMedia, Grid, Button, Alert, List, ListItem } from "@mui/material";
import axios from "axios";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`https://cretaluxurycruises.gr/wp-json/wc-bookings/v1/products/${id}`, {
          auth: {
            username: "ck_a2c988ce8493b2bb698b2cb117f12199f26602fe",
            password: "cs_0eeee35e62b2b2615e33dee615f5ca2fccd17da2",
          },
        });
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!product) return <Typography>No product found.</Typography>;

  return (
    <Container>
      <Grid container spacing={4}>
        {/* Left Side - Image */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.images[0]?.src || "https://via.placeholder.com/400"}
              alt={product.name}
            />
          </Card>
        </Grid>

        {/* Right Side - Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            €{product.price}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {product.short_description.replace(/(<([^>]+)>)/gi, "")}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Cruise Duration:
          </Typography>
          <Typography variant="body1" gutterBottom>
            {product.acf?.cruise_duration || "N/A"}
          </Typography>
          <Typography variant="h6" gutterBottom>
            The Price Includes:
          </Typography>
          <List>
            {[
              "Fuel",
              "Captain & Crew",
              "Fresh Towels",
              "Snorkeling Gear",
              "Free WiFi",
              "Open Bar",
            ].map((feature, index) => (
              <ListItem key={index}>{feature}</ListItem>
            ))}
          </List>
          <Alert severity="info">Please insert total number of persons, including kids and babies.</Alert>
          <Typography variant="body1" gutterBottom>
            Persons: <strong>1</strong>
          </Typography>
          <Button variant="contained" color="primary">
            Book Now
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProductDetail;
