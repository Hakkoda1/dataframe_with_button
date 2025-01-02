import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps,
} from "streamlit-component-lib"
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

import React, { useCallback, useEffect, useMemo, useState, ReactElement } from "react"


function TableComponent({ args, disabled, theme }: ComponentProps): ReactElement {
  const [data_json, setDataJson] = useState(JSON.parse(args["data_json"]));
  const [isFocused, setIsFocused] = useState(false);
  const clickable = args["clickable_column"]
  const [clickedButton, setClickedButton] = useState(null)
  const style = useMemo(() => {
    if (!theme) return {};
    const borderStyling = `1px solid ${isFocused ? theme.primaryColor : "gray"}`;
    return { border: borderStyling, outline: borderStyling };
  }, [theme, isFocused]);
    Streamlit.setComponentValue('')
  // const handleEdit = (id:any, field:any, value:any) => {
  //   setDataJson((prevData:any) =>
  //     prevData.map((row:any) =>
  //       row.ID === id ? { ...row, [field]: value } : row
  //     )
  //   );
  // };

  const onButtonClick = (value:any): void => {
    Streamlit.setComponentValue(value)
  }
  useEffect(() => {
    Streamlit.setFrameHeight();
  }, [style, theme]);

  const tableContainerStyle = {
    border: `2px solid ${theme?.primaryColor || "black"}`, // Custom border for the table
    borderRadius: "8px", // Optional rounded corners
  };




  return (
    <TableContainer component={Paper} style={tableContainerStyle}>
      <Table>
        <TableHead>
          <TableRow>
            {/* Dynamically generate table headers based on keys */}
            {Object.keys(data_json[0] || {}).map((key) =>
              <TableCell key={key}>{key.toUpperCase()}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data_json.map((row:any) => (
            <TableRow key={row.ID}>
              {Object.entries(row).map(([field, value]) => {
                if (field == clickable) return ( 
                <TableCell key = {field}>
                  <Button onClick={(e) => {onButtonClick(value)}}>{value}</Button>
                </TableCell>
                );
                else return (
                  <TableCell key={field}>
                    <TextField
                      value={value}
                      variant="outlined"
                      size="small"
                      disabled={true}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(TableComponent)