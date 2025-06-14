import React, { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Col, Form, Row, Badge, Card } from "react-bootstrap";
import { getVendorOrdersApi, updateVendorOrderStatusApi } from "../../services/allApi";
import { BASE_URL } from "../../services/baseUrl";
import { toast, ToastContainer } from "react-toastify";

function VendorOrder() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [status, setStatus] = useState({});
  const [currentFilter, setCurrentFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getVendorOrdersApi();
        console.log(response);
        
        if (response.success) {
          setOrders(response.data.orders);
          setFilteredOrders(response.data.orders);
        } else {
          setError("Failed to fetch orders");
        }
      } catch (err) {
        setError("Error fetching orders: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on status
  const filterOrders = (statusFilter) => {
    setCurrentFilter(statusFilter);
    
    if (statusFilter === "All") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => order.status === statusFilter);
      setFilteredOrders(filtered);
    }
  };

  const handleEditClick = (id) => {
    setEditRowId(id);
  };

  const handleSaveClick = async (id) => {
    const newStatus = status[id];

    if (!newStatus) {
      toast.warn("Please select a status before saving.");
      return;
    }

    try {
      const response = await updateVendorOrderStatusApi({
        orderId: id,
        status: newStatus,
      });

      console.log("API Response:", response);

      if (!response.success) {
        toast.error(response.message || "Failed to update status");
        return;
      }

      toast.success("Order status updated!");

      const updatedOrders = orders.map((order) =>
        order._id === id ? { ...order, status: newStatus } : order
      );

      setOrders(updatedOrders);
      setFilteredOrders(
        currentFilter === "All"
          ? updatedOrders
          : updatedOrders.filter((order) => order.status === currentFilter)
      );
      setEditRowId(null);
    } catch (err) {
      toast.error("Unexpected error occurred");
      console.error("Error updating status:", err);
    }
  };

  const handleStatusChange = (event, id) => {
    setStatus({ ...status, [id]: event.target.value });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailView(true);
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setSelectedOrder(null);
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN'); // Indian date format
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      "Confirmed": "primary",
      "Processing": "info",
      "Pending": "warning",
      "Cancelled": "danger",
      "Shipping": "secondary",
      "Delivered": "success",
      "Not_requested": "light"
    };
    
    return statusColors[status] || "light";
  };

  if (loading) return <div className="text-center mt-5">Loading orders...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  // Function to get color box preview
  const ColorBox = ({ color }) => (
    <div
      style={{
        backgroundColor: color || "#ddd",
        width: "24px",
        height: "24px",
        borderRadius: "4px",
        display: "inline-block",
        marginRight: "8px",
        border: "1px solid #ddd"
      }}
    />
  );

  // Detail view component
  const OrderDetailView = ({ order }) => {
    if (!order) return null;

    return (
      <div className="order-detail-view">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Order Details</h4>
          <button className="btn btn-outline-secondary" onClick={handleBackToList}>
            Back to Orders
          </button>
        </div>

        <Row>
          <Col md={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Product Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div 
                      className="product-color-preview"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "8px",
                        backgroundColor: order.color || "#ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        textShadow: "0 0 2px rgba(0,0,0,0.5)",
                        marginBottom: "10px"
                      }}
                    >
                      {order.colorName}
                    </div>
                  </Col>
                  <Col md={9}>
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td style={{width: "150px"}}><strong>Order ID:</strong></td>
                          <td>{order.orderId}</td>
                        </tr>
                        <tr>
                          <td><strong>Product ID:</strong></td>
                          <td>{order.productId}</td>
                        </tr>
                        <tr>
                          <td><strong>Size:</strong></td>
                          <td>{order.size}</td>
                        </tr>
                        <tr>
                          <td><strong>Color:</strong></td>
                          <td><ColorBox color={order.color} /> {order.colorName}</td>
                        </tr>
                        <tr>
                          <td><strong>Quantity:</strong></td>
                          <td>{order.quantity}</td>
                        </tr>
                        <tr>
                          <td><strong>Price:</strong></td>
                          <td className="fw-bold">₹{order.price.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Order Timeline</h5>
              </Card.Header>
              <Card.Body>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker bg-primary"></div>
                    <div className="timeline-content">
                      <h6>Order Created</h6>
                      <p className="text-muted">{formatDate(order.createdAt)} {new Date(order.createdAt).toLocaleTimeString('en-IN')}</p>
                    </div>
                  </div>
                  {order.status !== "Pending" && (
                    <div className="timeline-item">
                      <div className="timeline-marker bg-info"></div>
                      <div className="timeline-content">
                        <h6>Order Confirmed</h6>
                        <p className="text-muted">Status updated to {order.status}</p>
                      </div>
                    </div>
                  )}
                  {order.deliveryDetails?.deliveryDate && (
                    <div className="timeline-item">
                      <div className="timeline-marker bg-success"></div>
                      <div className="timeline-content">
                        <h6>Delivery Scheduled</h6>
                        <p className="text-muted">Expected delivery on {order.deliveryDetails.deliveryDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Order Status</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column align-items-center">
                  <Badge bg={getStatusColor(order.status)} className="px-4 py-2 mb-3" style={{fontSize: "1rem"}}>
                    {order.status}
                  </Badge>
                  
                  <Form.Select
                    className="mb-3"
                    value={status[order._id] || order.status}
                    onChange={(event) => handleStatusChange(event, order._id)}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Pending">Pending</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                  
                  <button 
                    className="btn btn-primary mt-2" 
                    onClick={() => handleSaveClick(order._id)}
                  >
                    Update Status
                  </button>
                </div>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Delivery Information</h5>
              </Card.Header>
              <Card.Body>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td><strong>Delivery Date:</strong></td>
                      <td>{order.deliveryDetails?.deliveryDate || "Not specified"}</td>
                    </tr>
                    <tr>
                      <td><strong>Message:</strong></td>
                      <td>{order.deliveryDetails?.deliveryMessage || "Not specified"}</td>
                    </tr>
                    <tr>
                      <td><strong>Return Status:</strong></td>
                      <td>
                        <Badge bg={order.returnStatus === "Not_requested" ? "success" : "warning"}>
                          {order.returnStatus}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Customer Information</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>Customer ID:</strong> {order.userId}</p>
                <p><strong>Address ID:</strong> {order.addressId}</p>
                <p><strong>Vendor ID:</strong> {order.vendorId}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="order">
      {showDetailView && selectedOrder ? (
        <OrderDetailView order={selectedOrder} />
      ) : (
        <>
          <Row className="mb-4">
            <Col className="text-start d-product-heading">
              <h4>Orders Management</h4>
              <p>Total Orders: {orders.length}</p>
            </Col>
          </Row>

          {/* Order Summary Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5>Total Sales</h5>
                  <h3>₹{orders.reduce((sum, order) => sum + order.itemTotal, 0).toLocaleString('en-IN')}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5>Confirmed Orders</h5>
                  <h3>{orders.filter(order => order.status === "Confirmed").length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5>Delivered Orders</h5>
                  <h3>{orders.filter(order => order.status === "Delivered").length}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filter Buttons */}
          <div className="filter-container mb-4 p-3 bg-light rounded">
            <div className="d-flex align-items-center mb-2">
              <h6 className="mb-0 me-3">Filter by Status:</h6>
            </div>
            <div className="d-flex flex-wrap">
              <button 
                className={`order-status-button mx-2 mb-2 ${currentFilter === "All" ? "active" : ""}`} 
                onClick={() => filterOrders("All")}
              >
                All
              </button>
              <button 
                className={`order-status-button mx-2 mb-2 ${currentFilter === "Confirmed" ? "active" : ""}`} 
                onClick={() => filterOrders("Confirmed")}
              >
                Confirmed
              </button>
              <button 
                className={`order-status-button mx-2 mb-2 ${currentFilter === "Processing" ? "active" : ""}`} 
                onClick={() => filterOrders("Processing")}
              >
                Processing
              </button>
              <button 
                className={`order-status-button mx-2 mb-2 ${currentFilter === "Pending" ? "active" : ""}`} 
                onClick={() => filterOrders("Pending")}
              >
                Pending
              </button>
              <button 
                className={`order-status-button mx-2 mb-2 ${currentFilter === "Cancelled" ? "active" : ""}`} 
                onClick={() => filterOrders("Cancelled")}
              >
                Cancelled
              </button>
              <button 
                className={`order-status-button mx-2 mb-2 ${currentFilter === "Shipped" ? "active" : ""}`} 
                onClick={() => filterOrders("Shipped")}
              >
                Shipped
              </button>
              <button 
                className={`order-status-button mx-2 mb-2 ${currentFilter === "Delivered" ? "active" : ""}`} 
                onClick={() => filterOrders("Delivered")}
              >
                Delivered
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <TableContainer component={Paper} className="Dproduct mb-4">
            <Table aria-label="orders table">
              <TableHead>
                <TableRow>
                   <TableCell className="dproduct-tablehead" align="left">
                                      SI No
                                    </TableCell>
                   <TableCell className="dproduct-tablehead" align="left">
                                      Product Name
                                    </TableCell>
                  <TableCell className="dproduct-tablehead">Color</TableCell>
                  <TableCell className="dproduct-tablehead" align="left">Order Date</TableCell>
                  <TableCell className="dproduct-tablehead" align="left">Customer ID</TableCell>
                  <TableCell className="dproduct-tablehead" align="left">Details</TableCell>
                  <TableCell className="dproduct-tablehead" align="left">Status</TableCell>
                  <TableCell className="dproduct-tablehead" align="right">Price</TableCell>
                  <TableCell className="dproduct-tablehead" align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order,index) => (
                    <TableRow key={order._id} hover>
                       <TableCell align="left" className="dorder-tabledata">
                                              {index + 1}
                                            </TableCell>
                                            <TableCell align="left" className="dorder-tabledata">
                                              <div>
                                                <div>{order.productId?._id}</div>
                                                {order.productId?.images?.[0] && (
                                                  <img
                                                    src={`${BASE_URL}/uploads/${order.productId.images[0]}`}
                                                    alt="Product"
                                                    style={{
                                                      width: "50px",
                                                      height: "50px",
                                                      objectFit: "cover",
                                                      marginTop: "5px",
                                                    }}
                                                  />
                                                )}
                                              </div>
                                            </TableCell>
                      <TableCell component="th" scope="row">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            backgroundColor: order.color || "#ddd",
                          }}
                          title={order.colorName}
                        />
                      </TableCell>
                      <TableCell align="left" className="dorder-tabledata">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell align="left" className="dorder-tabledata">
                        {order.userId.substring(0, 8)}...
                      </TableCell>
                      <TableCell align="left" className="dorder-tabledata">
                        <div>
                          <small>Size: <strong>{order.size}</strong></small><br/>
                          <small>Color: <strong>{order.colorName}</strong></small><br/>
                          <small>Qty: <strong>{order.quantity}</strong></small>
                        </div>
                      </TableCell>
                      <TableCell align="left" className="dorder-tabledata">
                        {editRowId === order._id ? (
                          <Form.Select
                            value={status[order._id] || order.status}
                            onChange={(event) => handleStatusChange(event, order._id)}
                            className="form-select-sm order-dropdown"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Pending">Pending</option>
                            <option value="Shipping">Shipping</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </Form.Select>
                        ) : (
                          <Badge bg={getStatusColor(order.status)}>{order.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell align="right" className="dorder-tabledata fw-bold">
                        ₹{order.itemTotal.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell align="center" className="dorder-tabledata">
                        <div className="d-flex justify-content-center">
                          {editRowId === order._id ? (
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleSaveClick(order._id)}
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEditClick(order._id)}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleViewDetails(order)}
                          >
                            View
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No orders found for the selected filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Order Statistics */}
          <Row className="mt-4">
            <Col md={12}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">Order Statistics</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3} className="text-center mb-3">
                      <div className="stat-card">
                        <h6>Pending Orders</h6>
                        <h2>{orders.filter(order => order.status === "Pending").length}</h2>
                      </div>
                    </Col>
                    <Col md={3} className="text-center mb-3">
                      <div className="stat-card">
                        <h6>Processing Orders</h6>
                        <h2>{orders.filter(order => order.status === "Processing").length}</h2>
                      </div>
                    </Col>
                    <Col md={3} className="text-center mb-3">
                      <div className="stat-card">
                        <h6>Shipped Orders</h6>
                        <h2>{orders.filter(order => order.status === "Shipped").length}</h2>
                      </div>
                    </Col>
                    <Col md={3} className="text-center mb-3">
                      <div className="stat-card">
                        <h6>Cancelled Orders</h6>
                        <h2>{orders.filter(order => order.status === "Cancelled").length}</h2>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Additional CSS for the component */}
          <style jsx>{`
            .timeline {
              position: relative;
              padding: 20px 0;
            }
            
            .timeline::before {
              content: '';
              position: absolute;
              top: 0;
              bottom: 0;
              left: 15px;
              width: 2px;
              background: #e9ecef;
            }
            
            .timeline-item {
              position: relative;
              padding-left: 40px;
              margin-bottom: 20px;
            }
            
            .timeline-marker {
              position: absolute;
              left: 0;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              text-align: center;
              line-height: 30px;
              color: white;
            }
            
            .order-status-button {
              border: 1px solid #dee2e6;
              background-color: #f8f9fa;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .order-status-button.active {
              background-color: #0d6efd;
              color: white;
              border-color: #0d6efd;
            }
            
            .order-status-button:hover:not(.active) {
              background-color: #e9ecef;
            }
            
            .stat-card {
              padding: 15px;
              border-radius: 8px;
              background-color: #f8f9fa;
              height: 100%;
            }
          `}</style>
        </>
      )}
      <ToastContainer></ToastContainer>
    </div>
  );
}

export default VendorOrder;