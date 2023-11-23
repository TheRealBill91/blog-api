const fs = require('fs').promises;
const path = require('path');

exports.getEmailConfirmationHtml = async (callbackUrl, emailTemplate) => {
  // Construct the file path
  const filePath = path.join(__dirname, '..', 'bin', 'utils', emailTemplate);

  // Read the file content
  const htmlContent = await fs.readFile(filePath, 'utf8');

  // Replace the placeholder with the actual callback URL
  return htmlContent.replace('{callbackUrl}', callbackUrl);
}