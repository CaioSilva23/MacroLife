
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,

} from '@mui/material';
import {
  Restaurant,
  Add,
  LocalDining,
} from '@mui/icons-material';


export default function Header({ refeicoes, onCriarRefeicao }) {
  return (
  <>
    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #0D1117 0%, #010409 100%)', border: '1px solid #80EF80' }}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: '#80EF80', color: '#010409',  width: 64, height: 64  }}>
            <Restaurant fontSize="large" />
        </Avatar>
        <Box>
            <Typography variant="h4" component="h1" sx={{ color: '#80EF80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalDining />
            Minhas Refeições
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Gerencie suas refeições personalizadas
            </Typography>
            {/* Estatísticas rápidas */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip 
                size="small" 
                label={`${refeicoes.length} ${refeicoes.length === 1 ? 'refeição' : 'refeições'}`}
                sx={{ 
                bgcolor: 'rgba(128, 239, 128, 0.2)', 
                color: '#80EF80',
                border: '1px solid #80EF80',
                fontSize: '0.75rem'
                }}
            />
            {refeicoes.length > 0 && (
                <Chip 
                size="small" 
                label={`${refeicoes.reduce((acc, r) => acc + r.total_kcal, 0).toFixed(0)} kcal total`}
                sx={{ 
                    bgcolor: 'rgba(128, 239, 128, 0.1)', 
                    color: '#80EF80',
                    border: '1px solid #80EF80',
                    fontSize: '0.75rem'
                }}
                />
            )}
            </Box>
        </Box>
        </Box>
        <Button 
        variant="contained"
        onClick={onCriarRefeicao}
        startIcon={<Add />}
        sx={{ 
            bgcolor: '#80EF80', 
            color: '#010409',
            borderRadius: 2,
            fontWeight: 'bold',
            '&:hover': {
            bgcolor: '#66CC66',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(128, 239, 128, 0.3)'
            },
            transition: 'all 0.3s ease'
        }}
        >
        Nova Refeição
        </Button>
    </Box>
    </Paper>
    </>
)
}