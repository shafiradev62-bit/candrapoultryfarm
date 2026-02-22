// Excel Data Import Script
// Save this as import_excel_data.js in your project root

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function importExcelData() {
  try {
    console.log('Starting Excel data import...');
    
    // Read your Excel file (you'll need to convert it to CSV first)
    // Or use a library like xlsx to read Excel directly
    
    // Example: Import from CSV
    const fs = require('fs');
    const csv = require('csv-parser');
    
    const results = [];
    
    fs.createReadStream('excel_import_template.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Processing ${results.length} records...`);
        
        // Insert data into temporary import table
        const { data, error } = await supabase
          .from('excel_import_temp')
          .insert(results);
          
        if (error) {
          console.error('Error inserting data:', error);
          return;
        }
        
        console.log('Data inserted successfully. Processing...');
        
        // Process the imported data
        const { data: processed, error: processError } = await supabase
          .rpc('process_excel_import');
          
        if (processError) {
          console.error('Error processing data:', processError);
          return;
        }
        
        console.log('Import completed:', processed);
        
        // Check import status
        const { data: status } = await supabase
          .from('excel_import_status')
          .select('*');
          
        console.log('Import status:', status[0]);
      });
      
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import
importExcelData();