import React, { useEffect, useState } from "react";
import "./offer.css";
import { Col, Form, Modal, Row, Toast } from "react-bootstrap";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Select from "react-select";

import { FaChevronDown } from "react-icons/fa";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import {
  createcouponApi,
  deletecouponApi,
  getallProducts,
  getCategoriesApi,
  getCouponApi,
  getCouponbyID,
  getSubCategoriesApi,
  updatecouponApi,
} from "../services/allApi";
import HashLoader from "react-spinners/HashLoader";
import { toast, ToastContainer } from "react-toastify";

function Coupon() {
  const [show, setShow] = useState(false);
  const [showcoupon, setShowCoupon] = useState(false);
  const [rows, setRows] = useState([]);

  const handleCloseoffer = () => setShowCoupon(false);
  const [CouponName, setCouponName] = useState("");
  const [startDate, setStartDate] = useState(null);

  const [expiryDate, setExpiryDate] = useState(null);
  const [amount, setAmount] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editshow, seteditShow] = useState(false);

  const [selectedamount, setselectedAmount] = useState("");
  const [selectedCouponName, setselectedCouponName] = useState("");
  const [selectedcouponType, setselectedCouponType] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [couponId, setCouponId] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [selectedcouponId, setSelectedcouponId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [couponType, setCouponType] = useState("");
  const [subcategories, setsubCategories] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [product, setProduct] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCouponApi();
      console.log(response);
      
      if (response && response.data) {
        setRows(response.data);
        setTotalPages(Math.ceil(response.data.length / rowsPerPage));
      }
    } catch (err) {
      setError("Failed to fetch coupons. Please try again.");
      console.error("Error fetching coupon data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (rows.length > 0) {
      setTotalPages(Math.ceil(rows.length / rowsPerPage));
    }
  }, [rows, rowsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getCurrentRows = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return rows.slice(startIndex, endIndex);
  };

  // Calculate pagination numbers
  const getPaginationNumbers = () => {
    const maxPagesToShow = 5;
    let paginationNumbers = [];
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      paginationNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Show a subset of pages with ellipsis
      if (currentPage <= 3) {
        paginationNumbers = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        paginationNumbers = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        paginationNumbers = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }
    
    return paginationNumbers;
  };

  // Get starting index for serial number
  const getStartIndex = () => {
    return (currentPage - 1) * rowsPerPage;
  };
  const fetchCategories = async () => {
    try {
      const response = await getCategoriesApi();
      console.log("category",response);
      
      if (response.success && Array.isArray(response.data)) {
        setCategories(
          response.data.map((cat) => ({ value: cat._id, label: cat.name }))
        );
      } else {
        console.error(
          "Failed to fetch categories:",
          response.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategory(selectedOptions);
  };

  const fetchProducts = async () => {
    try {
      const response = await getallProducts();
      console.log(response);

      if (response.success && Array.isArray(response.data.products)) {
        setProduct(response.data.products);
        setProduct(
          response.data.products.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))
        );
      } else {
        console.error(
          "Failed to fetch products:",
          response.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await getSubCategoriesApi();
      if (response.success && Array.isArray(response.data.subCategories)) {
        // Map API response to react-select format
        setsubCategories(
          response.data.subCategories.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))
        );
      } else {
        console.error(
          "Failed to fetch subcategories:",
          response.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error.message);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);
  const handleSubCategoryChange = (selectedSubcategoryOptions) => {
    setSelectedSubCategory(selectedSubcategoryOptions);
  };
  const handleShowOffer = async (couponId) => {
    try {
      const offerDetails = await getCouponbyID(couponId);
      console.log(offerDetails);

      setSelectedCoupon(offerDetails.data);
      

      setShowCoupon(true);
    } catch (error) {
      console.error("Error fetching offer details:", error);
    }
  };

  const handleProductChange = (selectedProductOptions) => {
    setSelectedProduct(selectedProductOptions);
  };
  const handleAddCoupon = async () => {
    if (
      !CouponName ||
      !couponType ||
      !amount ||
      !startDate ||
      !expiryDate ||
      !selectedCategory
    ) {
      toast.error("Please fill in all required fields, including the image.");
      return;
    }

    const couponData = {
      code: CouponName,
      type: couponType,
      value: amount,
      startDate: startDate,
      endDate: expiryDate,
      applicableCategories: selectedCategory.map((category) => category.value),
      applicableSubcategories: selectedSubCategory.map(
        (subcategories) => subcategories.value
      ),
      applicableProducts: selectedProduct.map((product) => product.value),
    };

    try {
      const response = await createcouponApi(couponData);
      if (response.success) {
        toast.success("coupon added successfully!");
        fetchCoupons();
        handleClose();
      } else {
        throw new Error(response.data.message || "Unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(
        `Failed to add category: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleEditShow = (offer) => {
    // Set other offer details
    setselectedAmount(offer.value);
    setselectedCouponName(offer.code);
    setselectedCouponType(offer.type);
    setSelectedcouponId(offer._id);
  
    // Map categories, subcategories, and products to the required format
    const mappedCategories = offer.applicableCategories.map((category) => ({
      label: category.name,
      value: category._id,
    }));
    const mappedSubcategories = offer.applicableSubcategories.map((subcategory) => ({
      label: subcategory.name,
      value: subcategory._id,
    }));
    const mappedProducts = offer.applicableProducts.map((product) => ({
      label: product.name,
      value: product._id,
    }));
  
    // Set selected values
    setSelectedCategory(mappedCategories); // Array of selected categories
    setSelectedSubCategory(mappedSubcategories); // Array of selected subcategories
    setSelectedProduct(mappedProducts); // Array of selected products
  
    // Show the edit modal
    seteditShow(true);
  };
  
  const handleEditClose = () => {
    seteditShow(false);
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();

    console.log("Button clicked");

    if (
      !selectedCouponName ||
      !selectedcouponType ||
      !selectedamount ||
      !startDate ||
      !expiryDate ||
      !selectedCategory
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    console.log("Proceeding with form submission");

    const offerData = {
      code: selectedCouponName,
      type: selectedcouponType,
      value: selectedamount,
      startDate,
      endDate: expiryDate,
      applicableCategories: selectedCategory.map((category) => category.value),
      applicableSubcategories: selectedSubCategory.map(
        (subcategories) => subcategories.value
      ),
      applicableProducts: selectedProduct.map((product) => product.value),
    };

    const offerId = selectedcouponId; // Ensure this contains the correct ID

    try {
      console.log("Sending offer data:", offerData);
      const response = await updatecouponApi(offerId, offerData); // Pass the offerId along with offerData

      // Log the entire response object to inspect it
      console.log("API Response:", response);

      if (response.status === 200) {
        toast.success("coupon updated successfully!");
        fetchCoupons(); // Check if fetchOffers() is fetching the updated data
        handleEditClose();
      } else {
        console.error("Failed to update offer:", response.data);
        throw new Error(response.data.message || "Unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error updating offer:", error);
      console.error(
        "Error details:",
        error.response ? error.response.data : error.message
      );
      toast.error(
        `Failed to update offer: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  
  const handleDeleteModalClose = () => setShowDeleteModal(false);
  const handleDeleteModalShow = (row) => {
    setCouponId(row._id);

    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponId) {
      toast.error("No coupon selected for deletion");
      return;
    }

    try {
      const response = await deletecouponApi(couponId);

      if (response.success) {
        toast.success("Coupon deleted successfully");
        fetchCoupons(); // Refresh the list after deletion
        handleDeleteModalClose();
      } else {
        toast.error(response.error || "Failed to delete Coupon");
      }
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    }
  };

  const deleteModal = (
    <Modal show={showDeleteModal} onHide={handleDeleteModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="category-modal-title">
          Confirm Deletion
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-with-scroll">
        <p className="delete-modal-text">
          Are you sure you want to delete this Coupon This action cannot be
          undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Row className="w-100">
          <Col>
            <button
              className="w-100 category-model-cancel"
              onClick={handleDeleteModalClose}
            >
              Cancel
            </button>
          </Col>
          <Col>
            <button
              className="w-100 category-model-add"
              onClick={handleDeleteConfirm}
            >
              Delete
            </button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
  );
  return (
    <div className="offer">
      <Row className="d-flex justify-content-between">
        <Col md={7}>
          <p className="Product-heading">Coupons</p>
        </Col>
        <Col md={2} className="d-flex justify-content-end">
          <button onClick={handleShow} className="w-100 addoffer-button">
            Add coupon
            <span className="ms-3">+</span>
          </button>
        </Col>
      </Row>
      <div className="coupon-table-container">
      {loading ? (
        <div className="spinner-overlay">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          {/* Pagination controls - top */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span>Show </span>
              <select
                className="form-select form-select-sm d-inline-block"
                style={{ width: '80px' }}
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span> entries</span>
            </div>
            <div>
              <span>Total Coupons: {rows.length}</span>
            </div>
          </div>

          {/* Table */}
         <div className="coupon-table-container">
        {loading ? (
          <div className="spinner-overlay">
            <HashLoader color="#36d7b7" size={60} />
          </div>
        ) : error ? (
          <Toast>
            <Toast.Body className="text-danger">
              {error} {/* Show the error message in a Toast */}
            </Toast.Body>
          </Toast>
        ) : (
          <TableContainer component={Paper} className="Dproduct">
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                <TableCell className="dproduct-tablehead">S.No</TableCell>

                  <TableCell className="dproduct-tablehead">Name</TableCell>
                  <TableCell className="dproduct-tablehead" align="left">
                    Status
                  </TableCell>
                  <TableCell className="dproduct-tablehead" align="left">
                    Type
                  </TableCell>
                  <TableCell className="dproduct-tablehead" align="left">
                    Amount
                  </TableCell>
                  <TableCell className="dproduct-tablehead" align="left">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentRows().map((row, index) => (
                  <TableRow
                    key={row._id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    
                    <TableCell
                      align="left"
                      className="dproduct-tabledata"
                      onClick={() => handleShowOffer(row._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {getStartIndex() + index + 1}
                    </TableCell>
                    <TableCell
                      align="left"
                      className="dproduct-tabledata"
                      onClick={() => handleShowOffer(row._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {row.code} {/* Assuming the coupon has a name field */}
                    </TableCell>
                    <TableCell align="left" className="dproduct-tabledata">
                      {row.status}
                    </TableCell>{" "}
                    {/* Assuming 'status' field */}
                    <TableCell align="left" className="dproduct-tabledata">
                      {row.type}
                    </TableCell>{" "}
                    {/* Assuming 'type' field */}
                    <TableCell align="left" className="dproduct-tabledata">
                      {row.value}
                    </TableCell>{" "}
                    {/* Assuming 'amount' field */}
                    <TableCell align="left" className="">
                      <span
                        className="edit-offer"
                        onClick={() => handleEditShow(row)}
                      >
                        Edit
                      </span>
                      <span
                        className="ms-3 remove-offer"
                        onClick={() => handleDeleteModalShow(row)}
                      >
                        Remove
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

          {/* Pagination info and controls - bottom */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Showing {rows.length > 0 ? getStartIndex() + 1 : 0} to {Math.min(getStartIndex() + rowsPerPage, rows.length)} of {rows.length} entries
            </div>
            <nav aria-label="Coupon pagination">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {getPaginationNumbers().map((pageNumber, index) => (
                  <li 
                    key={index} 
                    className={`page-item ${pageNumber === currentPage ? 'active' : ''} ${pageNumber === '...' ? 'disabled' : ''}`}
                  >
                    <button 
                      className="page-link"
                      onClick={() => pageNumber !== '...' && handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        style={{ borderRadius: "22px" }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="category-modal-title">Add Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="single-product-form-label">
                    Coupon Name
                  </Form.Label>
                  <Form.Control
                    className="single-product-form"
                    type="text"
                    placeholder="Enter Coupon name"
                    value={CouponName}
                    onChange={(e) => setCouponName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="single-product-form-label">
                    Amount
                  </Form.Label>
                  <Form.Control
                    className="single-product-form"
                    type="text"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="single-product-form-label">
                    Coupon Type
                  </Form.Label>
                  <div className="dropdown-wrapper">
                    <Form.Control
                      className="single-product-form custom-dropdown"
                      as="select"
                      defaultValue=""
                      aria-label="Select Coupon Type"
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value)}
                    >
                      <option value="">Select Coupon Type</option>
                      <option value="percentage">percentage</option>
                      <option value="fixed">fixed</option>
                    </Form.Control>
                    <FaChevronDown className="dropdown-icon" />
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Form.Group>
                    <Form.Label className="single-product-form-label">
                      Start Date
                    </Form.Label>
                    <div className="input-with-icon">
                      <DateTimePicker
                        style={{ border: "none" }}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        className="single-product-form datetime-picker"
                      />
                    </div>
                  </Form.Group>
                </LocalizationProvider>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Form.Group>
                    <Form.Label className="single-product-form-label">
                      Expiry Date
                    </Form.Label>
                    <div className="input-with-icon">
                      <DateTimePicker
                        style={{ border: "none" }}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                        value={expiryDate}
                        onChange={(date) => setExpiryDate(date)}
                        className="single-product-form datetime-picker"
                      />
                    </div>
                  </Form.Group>
                </LocalizationProvider>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="single-product-form-label">
                    Category
                  </Form.Label>
                  <Select
                    isMulti
                    options={categories}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    placeholder="Select categories"
                    className="custom-react-select "
                    classNamePrefix="react-select"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="single-product-form-label">
                    Sub Category
                  </Form.Label>
                  <Select
                    isMulti
                    options={subcategories}
                    value={selectedSubCategory}
                    onChange={handleSubCategoryChange}
                    placeholder="Select subcategories"
                    className="custom-react-select"
                    classNamePrefix="react-select"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="single-product-form-label">
                    Product
                  </Form.Label>
                  <Select
                    isMulti
                    options={product}
                    value={selectedProduct}
                    onChange={handleProductChange}
                    placeholder="Select products"
                    className="custom-react-select"
                    classNamePrefix="react-select"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Row className="justify-content-center">
            <Col md={6}>
              <button onClick={handleClose} className="offer-modal-cancel">
                Cancel
              </button>
            </Col>
            <Col md={6}>
              <button onClick={handleAddCoupon} className="offer-modal-add">
                Add Coupon
              </button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
      {deleteModal}
      <Modal
        show={showcoupon}
        onHide={handleCloseoffer}
        backdrop="static"
        keyboard={false}
        style={{ borderRadius: "22px" }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="category-modal-title">Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body></Modal.Body>
        <div>
          {selectedCoupon && (
            <Row className="offer-modal-row">
              <Col md={6}>
                <p className="offer-modal-title">Coupon Name</p>
                <p className="offer-modal-subtitle">{selectedCoupon.code}</p>
              </Col>
              <Col md={6}>
                <p className="offer-modal-title">Type</p>
                <p className="offer-modal-subtitle">{selectedCoupon.type}</p>
              </Col>

              <Col md={6} className="mt-3">
                <p className="offer-modal-title">Amount</p>
                <p className="offer-modal-subtitle">{selectedCoupon.value}</p>
              </Col>
              <Col md={6} className="mt-3">
                <p className="offer-modal-title">Expires on</p>
                <p className="offer-modal-subtitle">
                  {" "}
                  {new Date(selectedCoupon.endDate).toLocaleDateString("en-GB")}
                </p>
              </Col>

              <Col md={6} className="mt-3">
                <p className="offer-modal-title">Status</p>
                <p className="offer-modal-subtitle">{selectedCoupon.status}</p>
              </Col>
              <Col md={6} className="mt-3">
                <p className="offer-modal-title">Category</p>
                {selectedCoupon.applicableCategories &&
                selectedCoupon.applicableCategories.length > 0 ? (
                  <p className="offer-modal-subtitle">
                    {selectedCoupon.applicableCategories.map(
                      (category, index) => (
                        <span key={category._id}>
                          {category.name}
                          {index <
                            selectedCoupon.applicableCategories.length - 1 &&
                            ", "}
                        </span>
                      )
                    )}
                  </p>
                ) : (
                  <p className="offer-modal-subtitle">No Categories</p>
                )}
              </Col>

              <Col md={6} className="mt-3">
                <p className="offer-modal-title">Sub Category</p>
                {selectedCoupon.applicableSubcategories &&
                selectedCoupon.applicableSubcategories.length > 0 ? (
                  <p className="offer-modal-subtitle">
                    {selectedCoupon.applicableSubcategories.map(
                      (subcategory, index) => (
                        <span key={subcategory._id}>
                          {subcategory.name}
                          {index <
                            selectedCoupon.applicableSubcategories.length - 1 &&
                            ", "}
                        </span>
                      )
                    )}
                  </p>
                ) : (
                  <p className="offer-modal-subtitle">No Subcategories</p>
                )}
              </Col>

              <Col md={6} className="mt-3">
                <p className="offer-modal-title">Product Code</p>
                {selectedCoupon.applicableProducts &&
                selectedCoupon.applicableProducts.length > 0 ? (
                  <p className="offer-modal-subtitle">
                    {selectedCoupon.applicableProducts.map((product, index) => (
                      <span key={product._id}>
                        {product.name}
                        {index < selectedCoupon.applicableProducts.length - 1 &&
                          ", "}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="offer-modal-subtitle">No Products</p>
                )}
              </Col>
            </Row>
          )}
        </div>
      </Modal>

      <Modal
        show={editshow}
        onHide={handleEditClose}
        backdrop="static"
        keyboard={false}
        style={{ borderRadius: "22px" }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="category-modal-title">
            Edit Coupon
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="single-product-form-label">
                    Coupon Code
                  </Form.Label>
                  <Form.Control
                    className="single-product-form"
                    type="text"
                    placeholder="Enter Coupon name"
                    value={selectedCouponName}
                    onChange={(e) => setselectedCouponName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="single-product-form-label">
                    Amount
                  </Form.Label>
                  <Form.Control
                    className="single-product-form"
                    type="text"
                    placeholder="Enter Amount"
                    value={selectedamount}
                    onChange={(e) => setselectedAmount(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="single-product-form-label">
                    Coupon Type
                  </Form.Label>
                  <div className="dropdown-wrapper">
                    <Form.Control
                      className="single-product-form custom-dropdown"
                      as="select"
                      defaultValue=""
                      aria-label="Select Coupon Type"
                      value={selectedcouponType}
                      onChange={(e) => setselectedCouponType(e.target.value)}
                    >
                      <option value="">Select Coupon Type</option>
                      <option value="percentage">percentage</option>
                      <option value="fixed">fixed</option>
                    </Form.Control>
                    <FaChevronDown className="dropdown-icon" />
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Form.Group>
                    <Form.Label className="single-product-form-label">
                      Start Date
                    </Form.Label>
                    <div className="input-with-icon">
                      <DateTimePicker
                        style={{ border: "none" }}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        className="single-product-form datetime-picker"
                      />
                    </div>
                  </Form.Group>
                </LocalizationProvider>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Form.Group>
                    <Form.Label className="single-product-form-label">
                      Expiry Date
                    </Form.Label>
                    <div className="input-with-icon">
                      <DateTimePicker
                        style={{ border: "none" }}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                        value={expiryDate}
                        onChange={(date) => setExpiryDate(date)}
                        className="single-product-form datetime-picker"
                      />
                    </div>
                  </Form.Group>
                </LocalizationProvider>
              </Col>
            </Row>
            <Row className="mt-3">
  <Col md={12}>
    <Form.Group>
      <Form.Label className="single-product-form-label">Category</Form.Label>
      <Select
        isMulti
        options={categories}
        value={selectedCategory}
        onChange={handleCategoryChange}
        placeholder="Select categories"
        className="custom-react-select"
        classNamePrefix="react-select"
      />
    </Form.Group>
  </Col>
</Row>

<Row className="mt-3">
  <Col md={12}>
    <Form.Group>
      <Form.Label className="single-product-form-label">Sub Category</Form.Label>
      <Select
        isMulti
        options={subcategories}
        value={selectedSubCategory}
        onChange={handleSubCategoryChange}
        placeholder="Select subcategories"
        className="custom-react-select"
        classNamePrefix="react-select"
      />
    </Form.Group>
  </Col>
</Row>

<Row className="mt-3">
  <Col md={12}>
    <Form.Group>
      <Form.Label className="single-product-form-label">Product</Form.Label>
      <Select
        isMulti
        options={product}
        value={selectedProduct}
        onChange={handleProductChange}
        placeholder="Select products"
        className="custom-react-select"
        classNamePrefix="react-select"
      />
    </Form.Group>
  </Col>
</Row>


          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Row className="justify-content-center">
            <Col md={6}>
              <button onClick={handleEditClose} className="offer-modal-cancel">
                Cancel
              </button>
            </Col>
            <Col md={6}>
              <button onClick={handleEditCoupon} className="offer-modal-add">
                Edit Coupon
              </button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>

      <ToastContainer></ToastContainer>
    </div>
  );
}

export default Coupon;
