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
  Checkbox
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
      backgroundColor: '#F3F4F6',
      textTransform: 'uppercase',
      padding: '4px',
      borderRight: '1px solid #ddd',
      fontSize: '12px',
      color: 'gray'
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
        fontSize: 'inherit', // Matches table cell font size
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
                        <TextField sx = {textFieldStyle}
                          select
                          value={value}
                          variant="outlined"
                          size="small"
                          style={{border:'None'}}
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
                            <Checkbox
                              checked={value as boolean}
                              onChange={(e) => handleCheckboxChange(row[clickable], field, e.target.checked)}
                              style={checkboxStyle}
                            />
                          ) : (
                            <TextField sx = {textFieldStyle}
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
                          backgroundColor: value === clickedButton ? '#C7D0FC' : 'white',
                        }}>{value}</Button>
                      </TableCell>
                    );
                  } else {
                    return (
                        <TableCell key={field} sx={tableCellStyle}>
                          {typeof value === 'boolean' ? (
                            <Checkbox
                              checked={value}
                              disabled
                              size="small"
                              sx={checkboxStyle}
                            />
                          ) : (
                            <TextField
                              value={(value as string | number).toString()}
                              variant="outlined"
                              size="small"
                              disabled
                              sx={textFieldStyle}
                            />
                          )}
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