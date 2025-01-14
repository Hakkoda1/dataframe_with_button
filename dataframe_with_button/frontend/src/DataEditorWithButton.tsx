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
  Chip
} from "@mui/material";

import React, { useEffect, useMemo, useState } from "react";
function TableComponent({ args, disabled, theme }: ComponentProps): React.ReactElement {
  const editable: boolean = !!args["editable"];
  const [data_json, setDataJson] = useState(JSON.parse(args["data_json"]));
  const clickable = args["clickable_column"];
  const [clickedButton, setClickedButton] = useState(null);
  const categoricalInfo = args["categorical_info"] || {};
  const tableContainerStyle = {
    maxHeight: '400px', // Scrollable height for table
    margin: '0px 0',  // Add spacing above and below
    padding: '0px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: 'white', // Light background
    border: `2px solid rgba(0, 0, 0, 0.1)`,
    };
    const listStyle = {
      padding: '0px'
    }
    const tableHeadStyle = {
      backgroundColor: '#F3F4F6',
      textTransform: 'uppercase',
      padding: '4px',
      borderRight: '1px solid #ddd',
      fontSize: '12px',
      color: 'gray',
      textAlign: 'center'
    };
    const tableRowHoverStyle = {
      '&:hover': {
        backgroundColor: '#E5E7EB', // Highlight on hover
      },
    };
    const tableCellStyle = {
      borderRight: '1px solid #ddd', // Vertical border
      padding: '0px',
      margin: '0px'
    };
    const textFieldStyle = {
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          border: 'none', // Removes the border
        },
        backgroundColor: 'transparent', // Ensures no background
        padding: 0, // Removes extra padding
      },
      '& .MuiInputBase-input': {
        textAlign: 'inherit', // Matches table cell text alignment
      },
    };
    const checkboxStyle = {
      padding: '0px', // Removes extra padding
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };
  useEffect(() => {
    Streamlit.setFrameHeight();
  }, [data_json]);
  const handleEdit = (uniqueId: any, field: string, value: any): void => {
    const originalRow = data_json.find((row: any) => row[clickable] === uniqueId);
    if (!originalRow) return;
    const originalValue = originalRow[field];
    let parsedValue: any;
  
    if (Array.isArray(originalValue)) {
      parsedValue = value; // Already updated as an array
    } else if (typeof originalValue === 'number') {
      parsedValue = parseFloat(value);
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
      Streamlit.setComponentValue({ data: data_json, button: null });
    }
  };
  const onButtonClick = (value: any): void => {
    setClickedButton(value);
    // Return current state of data and clicked button
    Streamlit.setComponentValue({ data: data_json, button: value });
  };
  // if not editable
  if (editable){
    return (
      <TableContainer component={Paper} style={tableContainerStyle}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {Object.keys(data_json[0] || {}).map((key) => (
                <TableCell key={key} sx={tableHeadStyle}>{key.toUpperCase()}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data_json.map((row: any) => (
              <TableRow key={row[clickable]} sx={tableRowHoverStyle}>
                {Object.entries(row).map(([field, value]) => {
                  if (field === clickable) {
                    return (
                      <TableCell key={field} sx={{...tableCellStyle}}>
                        <Button
                        onClick={() => onButtonClick(value)}
                        style={{
                          backgroundColor: value === clickedButton ? '#C7D0FC' : 'white',
                        }}>{value}</Button>
                      </TableCell>
                    );
                  } else if (categoricalInfo[field]){
                    return (
                      <TableCell key={field} sx={tableCellStyle}>
                        <TextField sx = {{...textFieldStyle, textAlign: 'center', margin: '0px' }}
                          select
                          value={value}
                          variant="outlined"
                          size="small"
                          onChange={(e) =>
                            handleEdit(row[clickable], field, e.target.value)
                          }
                          SelectProps={{
                            native: true,
                          }}
                        >
                          {categoricalInfo[field].map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </TextField>
                      </TableCell>
                    );
                  } else {
                    return (
                      <TableCell key={field} sx={tableCellStyle}>
                      {(() => {
                        if (typeof value === 'boolean') {
                          return (
                            <Checkbox
                              checked={value}
                              onChange={(e) => handleCheckboxChange(row[clickable], field, e.target.checked)}
                              size="small"
                              sx={checkboxStyle}
                            />
                          );
                        }

                        if (typeof value === 'string') {
                          return (
                            <TextField
                              value={value}
                              variant="outlined"
                              size="small"
                              sx={textFieldStyle}
                              onChange={(e) => handleEdit(row[clickable], field, e.target.value)}
                              onKeyDown={(e) => handleKeyPress(e, row[clickable], field)}
                              onWheel={event => {event.preventDefault()}}

                            />
                          );
                        }
                        if (typeof value === 'number') {
                          return (
                            <TextField
                            value={value}
                            variant="outlined"
                            size="small"
                            onChange={(e) => handleEdit(row[clickable], field, e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, row[clickable], field)}
                            onWheel={event => {event.preventDefault()}}
                            sx={{ ...textFieldStyle, textAlign: 'right', margin: '0px' }}
                            >
                              {value}
                            </TextField>
                          );
                        }

                        if (Array.isArray(value)) {
                          return (
                            <TextField
                              value={value.join(', ')}
                              variant="outlined"
                              size="small"
                              sx={listStyle}
                              onChange={(e) =>
                                handleEdit(row[clickable], field, e.target.value.split(', '))
                              }
                              onKeyDown={(e) => handleKeyPress(e, row[clickable], field)}
                            />
                          );
                        }
                                                        return null; // Default case (optional)
                      })()}
                  </TableCell>

                    );
                  }
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  } else{
    return (
      <TableContainer component={Paper} style={tableContainerStyle}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {Object.keys(data_json[0] || {}).map((key) => (
                <TableCell key={key} sx={tableHeadStyle}>{key.toUpperCase()}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data_json.map((row: any) => (
              <TableRow key={row[clickable]} sx={tableRowHoverStyle}>
                {Object.entries(row).map(([field, value]) => {
                  if (field === clickable) {
                    return (
                      <TableCell key={field} sx={tableCellStyle}>
                        <Button onClick={() => onButtonClick(value)} style={{
                          backgroundColor: value === clickedButton ? '#C7D0FC' : 'white',
                        }}>{value}</Button>
                      </TableCell>
                    );
                  } else {
                    return (
                        <TableCell key={field} sx={tableCellStyle}>
                          {(() => {
                            if (typeof value === 'boolean') {
                              return (
                                <Checkbox
                                  checked={value}
                                  disabled
                                  size="small"
                                  sx={checkboxStyle}
                                />
                              );
                            }

                            if (typeof value === 'string') {
                              return (
                                <TextField
                                  value={value}
                                  variant="outlined"
                                  size="small"
                                  disabled
                                  sx={textFieldStyle}
                                />
                              );
                            }
                            
                            if (typeof value === 'number') {
                              return (
                                <TextField
                                  value={value}
                                  variant="outlined"
                                  size="small"
                                  disabled
                                  sx={{ ...textFieldStyle, textAlign: 'right' }}
                                />
                              );
                            }

                            if (Array.isArray(value)) {
                              return (
                                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                                  {value.map((v: any) => (
                                    <Chip key={v} label={v} size="small" sx={{ margin: '2px', fontSize: '12px'}} />
                                  ))}
                                </div>
                              );
                            }

                            return null;
                          })()}
                        </TableCell>
                    );
                  }
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}
export default withStreamlitConnection(TableComponent);