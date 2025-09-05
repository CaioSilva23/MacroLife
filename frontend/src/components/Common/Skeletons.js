import React from 'react';
import { 
  Box, 
  Skeleton, 
  Card, 
  CardContent, 
  Container,
  Paper,
  Grid
} from '@mui/material';

export const RefeicoesSkeleton = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header Skeleton */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Skeleton variant="circular" width={64} height={64} />
            <Box>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={300} height={24} />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="rounded" width={120} height={24} />
              </Box>
            </Box>
          </Box>
          <Skeleton variant="rounded" width={140} height={40} />
        </Box>
      </Paper>

      {/* Filter Skeleton */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={200} height={20} />
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Skeleton variant="rounded" width={32} height={32} />
            <Skeleton variant="rounded" width={150} height={32} />
            <Skeleton variant="rounded" width={32} height={32} />
            <Skeleton variant="rounded" width={80} height={32} />
          </Box>
        </Box>
      </Paper>

      {/* Summary Skeleton */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box>
              <Skeleton variant="text" width={180} height={24} />
              <Skeleton variant="text" width={120} height={20} />
            </Box>
          </Box>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={6} sm={3} key={item}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E0E0E0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width={80} height={20} sx={{ mx: 'auto' }} />
                  <Skeleton variant="rounded" width="100%" height={6} sx={{ my: 1 }} />
                  <Skeleton variant="text" width={100} height={16} sx={{ mx: 'auto' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Accordion Skeletons */}
      {[1, 2, 3].map((item) => (
        <Box key={item} sx={{ mb: 2 }}>
          <Paper elevation={1} sx={{ borderRadius: 2, p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box sx={{ flex: 1, mr: 2 }}>
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton variant="text" width={250} height={20} />
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Skeleton variant="rounded" width={60} height={20} />
                <Skeleton variant="rounded" width={60} height={20} />
                <Skeleton variant="rounded" width={60} height={20} />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
            </Box>
          </Paper>
        </Box>
      ))}
    </Container>
  );
};

export const CadastroSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header Skeleton */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={2}>
            <Skeleton variant="circular" width={56} height={56} />
            <Box>
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="text" width={150} height={20} />
            </Box>
          </Box>
          <Skeleton variant="rounded" width={100} height={40} />
        </Box>
      </Paper>

      {/* Form Skeleton */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Skeleton variant="rounded" width="100%" height={56} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="rounded" width="100%" height={100} />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} lg={8}>
                <Skeleton variant="rounded" width="100%" height={56} />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Box display="flex" gap={1}>
                  <Skeleton variant="rounded" flex={1} height={56} />
                  <Skeleton variant="rounded" width={56} height={56} />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Table Skeleton */}
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
              <Box sx={{ p: 2 }}>
                {[1, 2, 3].map((item) => (
                  <Box key={item} display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" flex={1} height={20} />
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={80} height={20} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Actions Skeleton */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={200} height={20} />
            <Skeleton variant="rounded" width={140} height={40} />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default { RefeicoesSkeleton, CadastroSkeleton };
