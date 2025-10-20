import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import dentalWebsiteSections from '../../data/DENTAL_WEBSITE_SECTIONS';

const ComponentTest = () => {
  const [components, setComponents] = useState([]);

  useEffect(() => {
    console.log('=== COMPONENT TEST ===');
    console.log('dentalWebsiteSections loaded:', dentalWebsiteSections?.length);

    if (dentalWebsiteSections) {
      setComponents(dentalWebsiteSections);
      console.log('Components set in state:', dentalWebsiteSections.length);
      console.log('First component:', dentalWebsiteSections[0]);
    }
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dental Components Test
      </Typography>

      <Typography variant="h6" gutterBottom>
        Total components loaded: {components.length}
      </Typography>

      {components.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          {components.map((component, index) => (
            <Paper key={component.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">
                {index + 1}. {component.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {component.description}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={component.category}
                  size="small"
                  color="primary"
                  sx={{ mr: 1 }}
                />
                {component.tags?.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Component HTML length: {component.component?.length || 0} characters
              </Typography>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography color="error">
          ❌ No components loaded!
        </Typography>
      )}
    </Box>
  );
};

export default ComponentTest;