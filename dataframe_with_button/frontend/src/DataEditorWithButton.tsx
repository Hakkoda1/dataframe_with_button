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
    const tableHeadStyle = {
      backgroundColor: '#f3f4f6', // Light gray for the header
      textTransform: 'uppercase',
      borderRight: '1px solid #ddd', // Vertical border
      fontFamily: "'Source Sans Pro', sans-serif", // Apply Source Sans Pro
      fontSize: '14px', // Adjust font size for readability    
      color: 'gray'
    };
    const tableRowHoverStyle = {
      '&:hover': {
        backgroundColor: '#e5e7eb', // Highlight on hover
      },
    };
    const tableCellStyle = {
      borderRight: '1px solid #ddd', // Vertical border
    };
    
 
  useEffect(() => {
    Streamlit.setFrameHeight();
  }, [data_json]);

  const handleEdit = (uniqueId: any, field: string, value: string): void => {
    const originalRow = data_json.find((row: any) => row[clickable] === uniqueId);
    if (!originalRow) return;

    const originalValue = originalRow[field];
    let parsedValue: string | number | boolean;
  
    // Parse value based on original type
    if (typeof originalValue === "number") {
      parsedValue = parseFloat(value);
    } else if (typeof originalValue === "boolean") {
      parsedValue = value === "true"; // Convert string "true"/"false" back to boolean
    } else {
      parsedValue = value; // Assume string for all other cases
    }
    
    originalRow[field] = parsedValue
    setDataJson((prev: any) =>
      prev.map((row: any) =>
        row[clickable] === uniqueId ? originalRow : row
      )
    );
    if (typeof originalValue == "boolean" || categoricalInfo[field]){
      Streamlit.setComponentValue({ data: data_json, button: null });
    }
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
                      <TableCell key={field} sx={tableCellStyle}>
                        <Button 
                        onClick={() => onButtonClick(value)}
                        style={{
                          backgroundColor: value === clickedButton ? '#c7d0fc' : 'white',
                        }}>{value}</Button>
                      </TableCell>
                    );
                  } else if (categoricalInfo[field]){
                    return (
                      <TableCell key={field} sx={tableCellStyle}>
                        <TextField
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
                        {
                          typeof value === "boolean" ? (
                            <TextField
                              select
                              value={(value as string | number | boolean).toString()}
                              variant="outlined"
                              size="small"
                              onChange={(e) =>
                                handleEdit(row[clickable], field, e.target.value)
                              }
                              SelectProps={{
                                native: true,
                              }}
                            >
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </TextField>
                          ) : (
                            <TextField
                              value={value}
                              variant="outlined"
                              size="small"
                              type={typeof value === "number" ? "number" : "text"}
                              onChange={(e) => handleEdit(row[clickable], field, e.target.value)}
                              onKeyDown={(e) => handleKeyPress(e, row[clickable], field)}
                              onWheel={event => {event.preventDefault()}}
                            />
                          )
                        }
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
              <TableRow key={row[clickable]}>
                {Object.entries(row).map(([field, value]) => {
                  if (field === clickable) {
                    return (
                      <TableCell key={field} sx={tableCellStyle}>
                        <Button onClick={() => onButtonClick(value)} style={{
                          backgroundColor: value === clickedButton ? '#c7d0fc' : 'white',
                        }}>{value}</Button>
                      </TableCell>
                    );
                  } else {
                    return (
                      <TableCell key={field} sx={tableCellStyle}>
                          <TextField
                          value={(value as string | number | boolean).toString()}
                          variant="outlined"
                            size="small"
                            disabled
                          />
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
