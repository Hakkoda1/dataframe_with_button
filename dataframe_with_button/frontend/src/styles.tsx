  export const tableContainerStyle = {
    maxHeight: '400px', // Scrollable height for table
    margin: '0px 0',  // Add spacing above and below
    padding: '0px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: 'white', // Light background
    border: `2px solid rgba(0, 0, 0, 0.1)`,
    };
export const listStyle = {
      padding: '0px'
    }
export const tableHeadStyle = {
      backgroundColor: '#F3F4F6',
      textTransform: 'uppercase',
      padding: '4px',
      borderRight: '1px solid #ddd',
      fontSize: '12px',
      color: 'gray',
      textAlign: 'center'
    };
export const tableRowHoverStyle = {
      '&:hover': {
        backgroundColor: '#E5E7EB', // Highlight on hover
      },
    };
export   const tableCellStyle = {
      borderRight: '1px solid #ddd', // Vertical border
      padding: '0px',
      margin: '0px'
    };
export const textFieldStyle = {
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
export const checkboxStyle = {
      padding: '0px', // Removes extra padding
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };
