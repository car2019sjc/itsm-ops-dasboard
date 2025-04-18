# IT Operations Dashboard - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Incident Analysis](#incident-analysis)
5. [Request Analysis](#request-analysis)
6. [AI-Powered Insights](#ai-powered-insights)
7. [Data Import and Export](#data-import-and-export)
8. [Filtering and Searching](#filtering-and-searching)
9. [Detailed Views](#detailed-views)
10. [Backup and Restore](#backup-and-restore)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

## Introduction

The IT Operations Dashboard is a powerful tool designed to help IT teams visualize, analyze, and gain insights from their incident and request data. This user guide will walk you through all the features and functionality of the dashboard.

## Getting Started

### Accessing the Dashboard

1. Open the application in your web browser
2. You will be presented with a login screen
3. Enter your credentials:
   - Username: `Onset-ISRA`
   - Password: `Socorro01@`
4. Click "Login" to access the dashboard

### Initial Setup

After logging in for the first time, you'll need to import your data:

1. You'll see the file upload screen
2. Click "Load Incidents" or "Load Requests" depending on your data type
3. Select an Excel file (.xlsx or .xls) containing your data
4. The system will process your file and display the dashboard

## Dashboard Overview

### Main Dashboard Components

The dashboard is divided into several key sections:

1. **Header Bar**: Shows the application title, environment information, and logout button
2. **Stats Cards**: Displays key metrics at the top of the dashboard
3. **Search and Filter Bar**: Allows you to search and filter the data
4. **Support Queues**: Shows active incidents by support queue
5. **Analysis Cards**: Provides access to different analysis views
6. **Analysis Panels**: Detailed analysis views that appear when you select an analysis card

### Navigation

- Use the analysis cards to navigate between different views
- Click on charts and data points to drill down into more detailed information
- Use the search bar to find specific incidents or requests
- Use the date filters to focus on specific time periods

## Incident Analysis

### Priority Analysis

The Priority Analysis view shows the distribution of incidents by priority level:

1. Click the "Por Prioridade" card
2. View the distribution of P1, P2, P3, and P4 incidents
3. Click on specific priority levels to see detailed incident lists
4. Analyze SLA compliance by priority

### Category Analysis

The Category Analysis view shows the distribution of incidents by category:

1. Click the "Por Categoria" card
2. View the distribution of incidents across different categories
3. Click on specific categories to see subcategories
4. Analyze priority distribution within each category

### Group Analysis

The Group Analysis view shows the distribution of incidents by assignment group:

1. Click the "Por Grupo" card
2. View the distribution of incidents across different support groups
3. Identify groups with high volumes or critical incidents
4. Click on groups to see detailed incident lists

### SLA Analysis

The SLA Analysis view shows compliance with Service Level Agreements:

1. Click the "Acordo de Nível de Serviço (SLA)" card
2. View SLA compliance rates by priority
3. Identify incidents that are outside SLA
4. Analyze trends in SLA compliance

### User Analysis

The User Analysis view shows incidents by caller:

1. Click the "Principais usuários" card
2. View the top users who have reported incidents
3. Analyze the types of incidents reported by each user
4. Click on users to see their incident history

### Location Analysis

The Location Analysis view shows incidents by location:

1. Click the "Por Localidade" card
2. View the distribution of incidents across different locations
3. Analyze trends by location over time
4. Filter by subcategory or assignment group

### Shift Analysis

The Shift Analysis view shows incidents by work shift:

1. Click the "Histórico por Turno" card
2. View the distribution of incidents across morning, afternoon, and night shifts
3. Analyze patterns specific to each shift
4. Configure shift times using the "Configurar Turnos" button

## Request Analysis

### Request Dashboard

To access the Request Dashboard:

1. Click the "Ir para Dashboard de Requests" button
2. View request-specific metrics and analysis
3. Use similar analysis views as the Incident Dashboard, but tailored for requests

### Request Analysis Views

The Request Dashboard includes several specialized views:

1. **Análise Geral**: Overview of all requests
2. **Por Categoria**: Analysis by request category
3. **Por Prioridade**: Analysis by priority level
4. **Histórico**: Historical analysis of requests
5. **Análise de SLA**: SLA compliance for requests
6. **Métricas**: Key performance indicators
7. **Performance**: Performance metrics by group and analyst
8. **Tendências**: Trend analysis over time

## AI-Powered Insights

### AI Analyst

The AI Analyst provides advanced insights into your incident data:

1. Click the "Análise Preditiva - IA" card
2. Wait for the AI to analyze your data
3. Review the root cause analysis
4. Explore identified patterns
5. Review recommendations
6. Analyze impact assessments
7. View shift-specific insights

### AI Predictive Analysis

The AI Predictive Analysis provides forward-looking insights for requests:

1. In the Request Dashboard, click the "Análise Preditiva - IA" card
2. Wait for the AI to analyze your request data
3. Review predictions and trends
4. Explore recommended actions
5. Analyze potential impacts

## Data Import and Export

### Importing Data

To import new data:

1. Click your username and select "Reload Data" or log out and log back in
2. Select "Load Incidents" or "Load Requests"
3. Choose your Excel file
4. Wait for the data to be processed
5. Review any validation warnings

### Supported File Formats

The dashboard supports Excel files (.xlsx or .xls) with the following columns:

#### For Incidents
- Number
- Opened
- Short description
- Caller
- Priority
- State
- Category
- Subcategory
- Assignment group
- Assigned to
- Updated
- Updated by
- Business impact
- Response Time
- Location
- Comments and Work notes

#### For Requests
- Number
- Opened
- Short description
- Request item [Catalog Task]
- Requested for Name
- Priority
- State
- Assignment group
- Assigned to
- Updated
- Updated by
- Comments and Work notes
- Business impact

## Filtering and Searching

### Search Bar

The search bar allows you to find specific incidents or requests:

1. Enter text in the search bar
2. The dashboard will filter to show only matching items
3. Search works across multiple fields (number, description, caller, etc.)

### Date Filters

To filter by date:

1. Use the date pickers to select start and end dates
2. Click "Selecionar Período" to open a calendar view
3. Use quick filters like "Últimos 30 dias" or "Últimos 7 dias"

### Category and Status Filters

To filter by category or status:

1. Use the category dropdown to select a specific category
2. Use the status dropdown to select a specific status
3. The dashboard will update to show only matching items

## Detailed Views

### Incident Details

To view detailed information about an incident:

1. Click on an incident in any list or chart
2. A modal will appear showing all incident details
3. View comments and work notes
4. See SLA information
5. View all metadata associated with the incident

### Critical Incidents Modal

To view critical incidents:

1. Click on the "P1/P2 Pendentes" stats card
2. A modal will appear showing all critical pending incidents
3. Review details and take action as needed

### Pending Incidents Modal

To view pending incidents:

1. Click on the "Chamados Pendentes" stats card
2. A modal will appear showing all pending incidents
3. Review details and take action as needed

### On Hold Incidents Modal

To view on-hold incidents:

1. Click on the "Chamados On Hold" stats card
2. A modal will appear showing all on-hold incidents
3. Review details and take action as needed

## Backup and Restore

### Creating a Backup

To create a backup of the application:

1. Run `npm run backup` in the terminal
2. The system will create a ZIP file in the `backups` directory
3. The backup will include all application files

### Restoring from Backup

To restore from a backup:

1. Run `npm run restore` to see available backups
2. Run `npm run restore backup-filename.zip` to restore a specific backup
3. Run `npm install` after restoration to reinstall dependencies

## Troubleshooting

### Common Issues

#### Data Import Errors
- Ensure your Excel file has the correct column headers
- Check for empty or invalid data in required fields
- Verify the file format is .xlsx or .xls

#### Chart Display Issues
- Ensure you have sufficient data for the selected date range
- Try clearing filters if no data appears
- Check browser console for any JavaScript errors

#### Performance Issues
- Limit the number of incidents/requests imported (large datasets may cause slowdowns)
- Close unused analysis panels
- Use more specific date ranges for analysis

### Error Messages

#### "Invalid credentials"
- Verify you're using the correct username and password
- Check for caps lock or typing errors

#### "No incidents found for the selected filters"
- Try broadening your search criteria
- Check that your date range includes relevant data

#### "Error processing file"
- Verify the file format and structure
- Check for corrupted data or special characters

## FAQ

### General Questions

**Q: How many incidents can the dashboard handle?**  
A: The dashboard can handle thousands of incidents, but performance may degrade with very large datasets. For optimal performance, limit to 10,000 incidents.

**Q: Is my data sent to any external servers?**  
A: Your incident and request data is processed entirely in your browser, except when using the AI analysis features, which send anonymized data to OpenAI's API.

**Q: Can I export analysis results?**  
A: The current version does not support exporting results. This feature may be added in future updates.

**Q: How accurate is the AI analysis?**  
A: The AI analysis provides insights based on patterns in your data. Its accuracy depends on the quality and quantity of your data. The system provides confidence scores for its analysis.

### Technical Questions

**Q: What browsers are supported?**  
A: The dashboard works best in modern browsers like Chrome, Firefox, Edge, and Safari.

**Q: Can I customize the dashboard?**  
A: The current version does not support customization. Future versions may include this feature.

**Q: How is the SLA calculated?**  
A: SLA is calculated based on the time between incident opening and resolution, compared against thresholds defined for each priority level:
- P1: 1 hour
- P2: 4 hours
- P3: 36 hours
- P4: 72 hours

**Q: How do I update the application?**  
A: Create a backup, then replace the application files with the new version. Restore your data if needed.