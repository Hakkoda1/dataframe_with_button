import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps,
} from "streamlit-component-lib";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Typography,
  Box,
  alpha,
  Popover,
  Tooltip
} from "@mui/material";

import React, { useEffect, useState, useRef } from "react";

// Define an interface for our row data
interface DataRow {
  [key: string]: any;
}

function TableComponent({ args, disabled, theme }: ComponentProps): React.ReactElement {
  const editable: boolean = !!args["editable"];
  const [data_json, setDataJson] = useState<DataRow[]>(JSON.parse(args["data_json"]));
  const clickable = args["clickable_column"];
  const [clickedButton, setClickedButton] = useState<any>(null);
  const categoricalInfo = args["categorical_info"] || {};
  
  // New states for enhanced functionality
  const [columnWidths, setColumnWidths] = useState<{[key: string]: number}>({});
  const [sortConfig, setSortConfig] = useState<{key: string | null, direction: 'ascending' | 'descending' | null}>({ key: null, direction: null });
  const [hoveredRow, setHoveredRow] = useState<DataRow | null>(null);
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState<{column: string, startX: number, startWidth: number} | null>(null);
  
  // State for cell content popup
  const [popupAnchorEl, setPopupAnchorEl] = useState<HTMLElement | null>(null);
  const [popupContent, setPopupContent] = useState<{content: any, title: string}>({
    content: null,
    title: ''
  });
  
  // Detect if we're in dark mode based on Streamlit theme
  const isDarkMode = theme?.base === 'dark';
  
  // Color definitions for a more attractive UI - theme aware
  const colors = {
    primary: theme?.primaryColor || '#3f51b5',
    primaryLight: alpha(theme?.primaryColor || '#3f51b5', 0.7),
    secondary: '#f50057', // Set a default since secondaryColor doesn't exist
    hover: isDarkMode ? alpha('#fff', 0.1) : '#f5f5f5',
    selected: isDarkMode ? alpha(theme?.primaryColor || '#3f51b5', 0.15) : '#e3f2fd',
    headerBg: isDarkMode ? alpha('#fff', 0.08) : '#eef2f6', // More distinct header background
    borderColor: isDarkMode ? alpha('#fff', 0.2) : '#e0e0e0',
    buttonHover: isDarkMode ? alpha('#fff', 0.1) : '#eaecf7',
    clickedButton: isDarkMode ? alpha(theme?.primaryColor || '#3f51b5', 0.3) : '#c7d0fc',
    background: isDarkMode ? '#2e2e2e' : 'white',
    text: isDarkMode ? '#fff' : '#000',
    textSecondary: isDarkMode ? '#ccc' : '#5f6368',
  };
  
  // Enhanced styling with theme awareness
  const tableContainerStyle = {
    maxHeight: '500px',
    margin: '8px 0',
    padding: '0px',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
    borderRadius: '8px',
    backgroundColor: colors.background,
    border: `2px solid ${colors.borderColor}`,
    position: 'relative' as 'relative',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column' as 'column',
  };

  const tableStyle = {
    borderCollapse: 'collapse' as 'collapse',
    width: '100%',
    position: 'relative' as 'relative',
    borderBottom: `2px solid ${colors.borderColor}`,
  };

  const tableBodyStyle = {
    position: 'relative' as 'relative',
  };
  
  const popoverStyle = {
    maxWidth: '300px',
    maxHeight: '200px',
    overflow: 'auto',
    padding: '8px 12px',
    backgroundColor: colors.background,
    color: colors.text,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  };
  
  const listStyle = {
    padding: '4px',
    color: colors.text, // Fix for list text color in dark mode
    '& .MuiInputBase-input': {
      color: colors.text,
    }
  }
  
  const tableHeadStyle = {
    backgroundColor: colors.headerBg,
    textTransform: 'none' as 'none', // Remove uppercase transformation
    padding: '8px 12px',
    borderRight: `1px solid ${colors.borderColor}`,
    fontSize: '13px',
    fontWeight: 600,
    color: colors.textSecondary,
    textAlign: 'center' as 'center',
    position: 'relative' as 'relative',
    userSelect: 'none' as 'none',
    whiteSpace: 'nowrap' as 'nowrap',
    cursor: 'default',
    '&:hover': {
      backgroundColor: alpha(colors.headerBg, 0.8),
    }
  };
  
  const tableRowHoverStyle = {
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colors.hover,
    },
    borderBottom: `1px solid ${colors.borderColor}`, // Add border bottom to each row
  };
  
  const tableCellStyle = {
    borderRight: `1px solid ${colors.borderColor}`,
    padding: '8px',
    margin: '0px',
    transition: 'all 0.2s',
    position: 'relative' as 'relative',
    minWidth: '80px',
    color: colors.text,
  };
  
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: 'none',
      },
      backgroundColor: 'transparent',
      padding: 0,
      '&:hover': {
        backgroundColor: alpha(colors.hover, 0.5),
      },
      '&.Mui-focused': {
        backgroundColor: alpha(colors.selected, 0.3),
      }
    },
    '& .MuiInputBase-input': {
      textAlign: 'inherit',
      padding: '6px 8px',
      fontSize: '14px',
      color: colors.text,
    },
    '& .MuiNativeSelect-icon': {
      color: colors.text, // Fix dropdown arrow color in dark mode
    },
    '& .MuiSelect-icon': {
      color: colors.text, // Fix dropdown arrow color in dark mode
    }
  };
  
  const checkboxStyle = {
    padding: '0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '& .MuiSvgIcon-root': {
      color: colors.text,
    }
  };
  
  const buttonStyle = {
    textTransform: 'none' as 'none',
    fontWeight: 500,
    fontSize: '13px',
    padding: '4px 10px',
    borderRadius: '4px',
    transition: 'all 0.2s',
    width: '100%',
    '&:hover': {
      backgroundColor: colors.buttonHover,
    }
  };
  
  const resizeHandleStyle = {
    position: 'absolute' as 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '6px',
    cursor: 'col-resize',
    zIndex: 1,
    '&:hover': {
      backgroundColor: colors.primary,
      opacity: 0.3,
    }
  };
  
  // Reset clicked button when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setClickedButton(null);
        Streamlit.setComponentValue({ data: data_json, button: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [data_json]);
  
  // Initialize column widths based on content
  useEffect(() => {
    if (data_json.length > 0) {
      const initialWidths: {[key: string]: number} = {};
      
      Object.keys(data_json[0] || {}).forEach(key => {
        // Set default width based on key length
        const contentLength = Math.max(
          key.length * 10,
          // Estimate average content length
          ...data_json.slice(0, 10).map((row: any) => {
            const value = row[key];
            if (typeof value === 'string') return Math.min(value.length * 8, 200);
            if (typeof value === 'number') return 80;
            if (typeof value === 'boolean') return 60;
            if (Array.isArray(value)) return Math.min(value.join(', ').length * 6, 200);
            return 100;
          })
        );
        
        initialWidths[key] = Math.max(80, Math.min(contentLength, 300));
      });
      
      setColumnWidths(initialWidths);
    }
  }, [data_json]);
  
  useEffect(() => {
    Streamlit.setFrameHeight();
  }, [data_json, columnWidths]);
  
  // Handle global mouse events for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      
      const delta = e.clientX - resizing.startX;
      const newWidth = Math.max(80, resizing.startWidth + delta);
      
      setColumnWidths(prev => ({
        ...prev,
        [resizing.column]: newWidth
      }));
    };
    
    const handleMouseUp = () => {
      setResizing(null);
    };
    
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);
  
  const handleResizeStart = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizing({
      column,
      startX: e.clientX,
      startWidth: columnWidths[column] || 100
    });
  };
  
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
    
    if (direction === null) {
      // Reset to original order
      setDataJson(JSON.parse(args["data_json"]));
      return;
    }
    
    const sortedData = [...data_json].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return direction === 'ascending' 
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1);
      }
      
      // For strings and other types
      const aString = String(aValue);
      const bString = String(bValue);
      
      return direction === 'ascending' 
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
    
    setDataJson(sortedData);
  };
  
  const handleEdit = (uniqueId: any, field: string, value: any): void => {
    const originalRow = data_json.find((row: any) => row[clickable] === uniqueId);
    if (!originalRow) return;
    const originalValue = originalRow[field];
    let parsedValue: any;
  
    // Special handling for Email fields - always treat as strings
    if (field === "Email" || field.toLowerCase().includes("email")) {
      parsedValue = value === null || value === undefined ? "" : String(value);
    } else if (Array.isArray(originalValue)) {
      parsedValue = value; // Already updated as an array
    } else if (typeof originalValue === 'number' || originalValue === null || String(originalValue) === 'NaN') {
      // Handle NaN values by converting them to numbers if possible
      const numValue = parseFloat(value);
      parsedValue = isNaN(numValue) && value !== '' ? value : numValue;
    } else if (typeof originalValue === 'boolean') {
      parsedValue = value === 'true';
    } else {
      parsedValue = value; // Default case (e.g., strings)
    }
  
    originalRow[field] = parsedValue;
    setDataJson((prev: any) =>
      prev.map((row: any) => (row[clickable] === uniqueId ? originalRow : row))
    );
    if (typeof originalValue == "boolean" || categoricalInfo[field]){
      Streamlit.setComponentValue({ data: data_json, button: null });
    }
  };

  const handleCheckboxChange = (uniqueId: any, field: string, checked: boolean): void => {
    const originalRow = data_json.find((row: any) => row[clickable] === uniqueId);
    if (!originalRow) return;
    // Directly use the boolean `checked` value since this is specifically for checkboxes
    originalRow[field] = checked;
    setDataJson((prev: any) =>
      prev.map((row: any) =>
        row[clickable] === uniqueId ? originalRow : row
      )
    );
    // Assuming you want to call Streamlit.setComponentValue similarly to handleEdit
    Streamlit.setComponentValue({ data: data_json, button: null });
  };

  const handleKeyPress = (e: React.KeyboardEvent, rowIndex: number, field: string): void => {
    if (e.key === "Enter") {
      // Always save changes on Enter press
      Streamlit.setComponentValue({ data: data_json, button: null });
    }
  };
  
  const onButtonClick = (value: any, row: DataRow): void => {
    setClickedButton(value);
    setSelectedRow(row);
    // Return current state of data and clicked button
    Streamlit.setComponentValue({ data: data_json, button: value });
  };
  
  // Function to handle cell click for showing popup
  const handleCellClick = (event: React.MouseEvent<HTMLElement>, field: string, value: any) => {
    // Store the clicked element and content
    setPopupAnchorEl(event.currentTarget);
    setPopupContent({
      content: value,
      title: field
    });
  };
  
  // Function to close popup
  const handleClosePopup = () => {
    setPopupAnchorEl(null);
  };
  
  // Render popup content based on type
  const renderPopupContent = (content: any) => {
    if (Array.isArray(content)) {
      return (
        <Box sx={{ maxHeight: '180px', overflow: 'auto' }}>
          {content.map((item, index) => (
            <Chip 
              key={index}
              label={item}
              sx={{ 
                margin: '2px', 
                fontSize: '12px',
                backgroundColor: alpha(colors.primary, 0.1),
                color: colors.text
              }}
            />
          ))}
        </Box>
      );
    }
    
    if (typeof content === 'string') {
      return (
        <Typography 
          variant="body2" 
          sx={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word', 
            color: colors.text,
            maxHeight: '180px',
            overflow: 'auto'
          }}
        >
          {content}
        </Typography>
      );
    }
    
    // For numbers, booleans, or other types
    return (
      <Typography variant="body2" sx={{ color: colors.text }}>
        {String(content)}
      </Typography>
    );
  };
  
  // Render either editable or non-editable table
  const renderTable = () => {
    // Get the index of the last row for special styling
    const lastRowIndex = data_json.length - 1;
    
    return (
      <Box sx={{ position: 'relative' }}>
        <TableContainer 
          component={Paper} 
          style={tableContainerStyle} 
          ref={tableRef}
        >
          <Table stickyHeader style={tableStyle}>
            <TableHead>
              <TableRow sx={{ borderBottom: `2px solid ${colors.borderColor}` }}>
                {Object.keys(data_json[0] || {}).map((key) => (
                  <TableCell 
                    key={key} 
                    sx={{
                      ...tableHeadStyle,
                      width: `${columnWidths[key] || 100}px`,
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>{key}</span>
                      <IconButton 
                        size="small" 
                        onClick={() => handleSort(key)}
                        sx={{ padding: '2px', color: colors.textSecondary }}
                      >
                        {sortConfig.key === key ? (
                          sortConfig.direction === 'ascending' ? 
                            <span style={{ fontSize: '16px' }}>▲</span> : 
                            <span style={{ fontSize: '16px' }}>▼</span>
                        ) : (
                          <span style={{ fontSize: '16px', opacity: 0.3 }}>⇅</span>
                        )}
                      </IconButton>
                    </Box>
                    <div 
                      style={{...resizeHandleStyle}}
                      onMouseDown={(e) => handleResizeStart(key, e)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={tableBodyStyle}>
              {data_json.map((row: any) => (
                <TableRow 
                  key={row[clickable]} 
                  sx={{
                    ...tableRowHoverStyle,
                    backgroundColor: selectedRow === row ? colors.selected : 
                                    hoveredRow === row ? colors.hover : 'inherit',
                    // Add a thicker border to the last row
                    ...(data_json.indexOf(row) === lastRowIndex && {
                      borderBottom: `2px solid ${colors.borderColor}`
                    })
                  }}
                  onMouseEnter={() => setHoveredRow(row)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => setSelectedRow(row)}
                >
                  {Object.entries(row).map(([field, value]) => {
                    // Render cell content based on field type
                    if (field === clickable) {
                      return (
                        <TableCell 
                          key={field} 
                          sx={{
                            ...tableCellStyle,
                            width: `${columnWidths[field] || 100}px`,
                          }}
                        >
                          <Button
                            onClick={(e) => onButtonClick(value, row)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: value === clickedButton ? colors.clickedButton : isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
                              color: value === clickedButton ? colors.primary : colors.text,
                            }}
                          >
                            {value}
                          </Button>
                        </TableCell>
                      );
                    } else if (categoricalInfo[field]){
                      return (
                        <TableCell 
                          key={field} 
                          sx={{
                            ...tableCellStyle,
                            width: `${columnWidths[field] || 100}px`,
                          }}
                        >
                          {editable ? (
                            <TextField 
                              sx = {{...textFieldStyle, textAlign: 'center', margin: '0px', width: '100%' }}
                              select
                              value={value}
                              variant="outlined"
                              size="small"
                              onChange={(e) =>
                                handleEdit(row[clickable], field, e.target.value)
                              }
                              SelectProps={{
                                native: true,
                                sx: {
                                  color: colors.text,
                                  '& .MuiNativeSelect-icon': {
                                    color: colors.text,
                                  }
                                }
                              }}
                            >
                              {categoricalInfo[field].map((option: string) => (
                                <option key={option} value={option} style={{ color: isDarkMode ? '#fff' : '#000', backgroundColor: isDarkMode ? '#333' : '#fff' }}>
                                  {option}
                                </option>
                              ))}
                            </TextField>
                          ) : (
                            <Tooltip title="Click to view full content">
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: colors.text,
                                  cursor: 'pointer',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={(e) => handleCellClick(e, field, value)}
                              >
                                {value}
                              </Typography>
                            </Tooltip>
                          )}
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell 
                          key={field} 
                          sx={{
                            ...tableCellStyle,
                            width: `${columnWidths[field] || 100}px`,
                          }}
                        >
                        {(() => {
                          if (typeof value === 'boolean') {
                            return (
                              <Checkbox
                                checked={value}
                                onChange={editable ? (e) => handleCheckboxChange(row[clickable], field, e.target.checked) : undefined}
                                disabled={!editable}
                                size="small"
                                sx={checkboxStyle}
                              />
                            );
                          }

                          if (typeof value === 'string') {
                            return editable ? (
                              <TextField
                                value={value}
                                variant="outlined"
                                size="small"
                                sx={{...textFieldStyle, width: '100%'}}
                                onChange={(e) => handleEdit(row[clickable], field, e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, row[clickable], field)}
                                onWheel={event => {event.preventDefault()}}
                              />
                            ) : (
                              <Tooltip title="Click to view full content">
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    padding: '6px 8px',
                                    fontSize: '14px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: `${columnWidths[field] - 16}px`,
                                    cursor: 'pointer',
                                    color: colors.text
                                  }}
                                  onClick={(e) => handleCellClick(e, field, value)}
                                >
                                  {value}
                                </Typography>
                              </Tooltip>
                            );
                          }
                          
                          // If field is "Email" or contains "email" (case insensitive), treat it as a string
                          if (field === "Email" || field.toLowerCase().includes("email")) {
                            const displayValue = value === null || value === undefined || String(value) === 'NaN' 
                              ? "" 
                              : String(value);
                            
                            return editable ? (
                              <TextField
                                value={displayValue}
                                variant="outlined"
                                size="small"
                                sx={{...textFieldStyle, width: '100%'}}
                                onChange={(e) => handleEdit(row[clickable], field, e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, row[clickable], field)}
                                onWheel={event => {event.preventDefault()}}
                              />
                            ) : (
                              <Tooltip title="Click to view full content">
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    padding: '6px 8px',
                                    fontSize: '14px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: `${columnWidths[field] - 16}px`,
                                    cursor: 'pointer',
                                    color: colors.text
                                  }}
                                  onClick={(e) => handleCellClick(e, field, value)}
                                >
                                  {displayValue}
                                </Typography>
                              </Tooltip>
                            );
                          }
                          
                          if (typeof value === 'number' || value === null || String(value) === 'NaN') {
                            const isNaNValue = isNaN(Number(value)) || value === null || String(value) === 'NaN';
                            return editable ? (
                              <TextField
                                value={isNaNValue ? '' : value}
                                variant="outlined"
                                size="small"
                                onChange={(e) => handleEdit(row[clickable], field, e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, row[clickable], field)}
                                onWheel={event => {event.preventDefault()}}
                                sx={{ ...textFieldStyle, textAlign: 'right', width: '100%' }}
                                placeholder="Enter a number"
                              />
                            ) : (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  padding: '6px 8px',
                                  fontSize: '14px',
                                  textAlign: 'right',
                                  color: colors.text
                                }}
                              >
                                {isNaNValue ? "NaN" : value}
                              </Typography>
                            );
                          }

                          if (Array.isArray(value)) {
                            return editable ? (
                              <TextField
                                value={value.join(', ')}
                                variant="outlined"
                                size="small"
                                sx={{...listStyle, width: '100%'}}
                                InputProps={{
                                  style: { color: colors.text }
                                }}
                                onChange={(e) =>
                                  handleEdit(row[clickable], field, e.target.value.split(', '))
                                }
                                onKeyDown={(e) => handleKeyPress(e, row[clickable], field)}
                              />
                            ) : (
                              <Box 
                                sx={{
                                  display: 'flex', 
                                  flexWrap: 'wrap',
                                  maxHeight: '60px',
                                  overflow: 'hidden',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => handleCellClick(e, field, value)}
                              >
                                {value.slice(0, 3).map((v: any, i: number) => (
                                  <Chip 
                                    key={`${v}-${i}`} 
                                    label={v} 
                                    size="small" 
                                    sx={{ 
                                      margin: '2px', 
                                      fontSize: '12px',
                                      backgroundColor: alpha(colors.primary, 0.1),
                                      color: colors.text
                                    }} 
                                  />
                                ))}
                                {value.length > 3 && (
                                  <Chip 
                                    label={`+${value.length - 3} more`} 
                                    size="small" 
                                    sx={{ 
                                      margin: '2px', 
                                      fontSize: '12px',
                                      backgroundColor: alpha(colors.primary, 0.05),
                                      color: colors.text
                                    }} 
                                  />
                                )}
                              </Box>
                            );
                          }
                          
                          return null; // Default case
                        })()}
                        </TableCell>
                      );
                    }
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Add an extra border at the end of the table with fixed position */}
          <div style={{ 
            height: '2px', 
            backgroundColor: colors.borderColor, 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 2
          }} />
        </TableContainer>
        
        {/* Add an additional border element outside of the scrollable container for consistency */}
        <div style={{ 
          height: '2px', 
          backgroundColor: colors.borderColor,
          width: '100%',
          borderBottomLeftRadius: '6px',
          borderBottomRightRadius: '6px',
        }} />
        
        {/* Cell Content Popover */}
        <Popover
          open={Boolean(popupAnchorEl)}
          anchorEl={popupAnchorEl}
          onClose={handleClosePopup}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          PaperProps={{
            style: popoverStyle
          }}
        >
          <Box sx={{ 
            padding: '8px',
            maxHeight: '200px', 
            overflow: 'auto' 
          }}>
            {renderPopupContent(popupContent.content)}
          </Box>
        </Popover>
      </Box>
    );
  };
  
  return renderTable();
}

export default withStreamlitConnection(TableComponent);