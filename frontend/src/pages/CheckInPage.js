import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress, Card, CardContent, Snackbar, Container, Fade, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AccessTime as AccessTimeIcon, Check as CheckIcon, EventAvailable as EventAvailableIcon, Security as SecurityIcon } from '@mui/icons-material';
import WebcamCapture from '../components/WebcamCapture';
import { attendanceApi, employeeApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CheckInPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [securityMessage, setSecurityMessage] = useState(null);
  const navigate = useNavigate();
  const { currentUser, getEmployeeId } = useAuth();
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Get current employee information on page load
  useEffect(() => {
    const fetchCurrentEmployee = async () => {
      try {
        setLoading(true);
        const employeeId = getEmployeeId();
        if (!employeeId) {
          setError("Không thể xác định nhân viên hiện tại. Vui lòng đăng nhập lại.");
          return;
        }
        
        const response = await employeeApi.getById(employeeId);
        setCurrentEmployee(response.data);
        setSecurityMessage(`Xác thực nhân viên: ${response.data.first_name} ${response.data.last_name}`);
      } catch (err) {
        console.error("Error fetching current employee:", err);
        setError("Không thể tải thông tin nhân viên. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentEmployee();
  }, [getEmployeeId]);

  const handleCapture = async (imageFile) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Ensure we have the current employee's ID
    const employeeId = getEmployeeId();
    if (!employeeId || !currentEmployee) {
      setError("Không thể xác định thông tin nhân viên. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    try {
      // Pass the employee ID to ensure check-in is only for the logged-in employee
      const response = await attendanceApi.checkInOut(imageFile, employeeId);
      
      // Verify the recognized employee matches the current user
      if (response.data.employee_id && response.data.employee_id !== employeeId) {
        setError("Khuôn mặt không khớp với tài khoản đang đăng nhập. Vui lòng chỉ chấm công cho chính mình.");
        setLoading(false);
        return;
      }
      
      setResult(response.data);
      setShowSuccess(true);
      console.log("Kết quả từ API:", response.data); // Log để debug
      
      // Tự động chuyển về trang dashboard sau 3 giây
      setTimeout(() => {
        navigate('/reports');
      }, 3000);
    } catch (err) {
      console.error('Error during check-in/out:', err);
      
      // Handle different error scenarios
      if (err.response?.data?.error?.includes('face')) {
        setError('Không nhận diện được khuôn mặt hoặc khuôn mặt không khớp. Vui lòng thử lại.');
      } else if (err.response?.data?.error?.includes('permission') || err.response?.data?.error?.includes('unauthorized')) {
        setError('Bạn không có quyền chấm công cho người khác.');
      } else {
        setError(err.response?.data?.error || 'Có lỗi xảy ra khi chấm công. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        width: '100%' 
      }}>
        {/* Header section with current time */}
        <Box sx={{ 
          width: '100%',
          maxWidth: '800px', 
          mb: 4, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Typography 
            variant="h4" 
            fontWeight="600" 
            sx={{ 
              mb: 1,
              color: '#263238',
              textAlign: 'center'
            }}
          >
            Chấm công bằng khuôn mặt
          </Typography>
          
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1
          }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" color="primary.main" fontWeight="500">
              {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Typography>
          </Box>
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
          
          <Divider sx={{ width: '80%', mb: 4 }} />
        </Box>
        
        {/* Main content */}
        <WebcamCapture 
          onCapture={handleCapture} 
          isLoading={loading} 
          error={error} 
        />
        
        {/* Success Snackbar notification */}
        <Snackbar 
          open={showSuccess} 
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            severity="success" 
            variant="filled"
            icon={<CheckIcon />}
            sx={{ 
              width: '100%',
              boxShadow: 3
            }}
          >
            Check-in thành công! Đang chuyển về trang chủ...
          </Alert>
        </Snackbar>

        {/* Result information card */}
        {result && (
          <Fade in={true} timeout={800}>
            <Card 
              elevation={4} 
              sx={{ 
                p: 3, 
                mt: 4, 
                width: '100%', 
                maxWidth: '800px',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e0e0e0'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                p: 2,
                bgcolor: 'success.light',
                borderRadius: 1,
                color: 'success.dark'
              }}>
                <CheckIcon sx={{ mr: 1 }} />
                <Typography variant="body1" fontWeight="500">
                  {result.message}
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
                pb: 1,
                mb: 2
              }}>
                <EventAvailableIcon sx={{ mr: 1 }} />
                Thông tin chấm công
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2
              }}>
                {result.check_in_time && (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Giờ vào
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {new Date(result.check_in_time).toLocaleTimeString('vi-VN')}
                    </Typography>
                  </Paper>
                )}
                
                {result.check_out_time && (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Giờ ra
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {new Date(result.check_out_time).toLocaleTimeString('vi-VN')}
                    </Typography>
                  </Paper>
                )}
                
                {result.worked_time && (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      gridColumn: { xs: '1', sm: '1 / span 2' }
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Thời gian làm việc
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {result.worked_time}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Card>
          </Fade>
        )}
      </Box>
    </Container>
  );
};

export default CheckInPage; 