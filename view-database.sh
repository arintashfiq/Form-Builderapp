#!/bin/bash

echo "🗄️  Form Builder Database Viewer"
echo "================================"

# Check if MySQL is running
if ! mysql -u root -e "SELECT 1;" &> /dev/null; then
    echo "❌ MySQL is not running or not accessible"
    exit 1
fi

echo "✅ Connected to MySQL"
echo ""

# Show database info
echo "📊 Database Overview:"
echo "--------------------"
mysql -u root -e "
USE form_builder;
SELECT 
    (SELECT COUNT(*) FROM forms) as total_forms,
    (SELECT COUNT(*) FROM form_submissions) as total_submissions;
"

echo ""
echo "📝 Recent Forms:"
echo "----------------"
mysql -u root -e "
USE form_builder;
SELECT 
    LEFT(id, 8) as form_id,
    name,
    JSON_LENGTH(fields) as field_count,
    created_at
FROM forms 
ORDER BY created_at DESC 
LIMIT 5;
"

echo ""
echo "📋 Recent Submissions:"
echo "----------------------"
mysql -u root -e "
USE form_builder;
SELECT 
    LEFT(fs.id, 8) as submission_id,
    LEFT(fs.form_id, 8) as form_id,
    f.name as form_name,
    JSON_LENGTH(fs.data) as response_count,
    fs.submitted_at
FROM form_submissions fs
JOIN forms f ON fs.form_id = f.id
ORDER BY fs.submitted_at DESC 
LIMIT 5;
"

echo ""
echo "💡 Usage Tips:"
echo "--------------"
echo "• View all forms: mysql -u root -e 'USE form_builder; SELECT * FROM forms;'"
echo "• View submissions for a form: mysql -u root -e 'USE form_builder; SELECT * FROM form_submissions WHERE form_id=\"FORM_ID_HERE\";'"
echo "• View form responses in web app: http://localhost:3000 → Click 'Submissions' on any form"
echo "• Export data: Use the 'Export CSV' button in the web interface"