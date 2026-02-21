const puppeteer = require("puppeteer");

exports.generateContractPdf = async (
	htmlContent,
	tenantSignatureUrl,
	listerSignatureUrl
) => {
	try {
		const launchOptions = {
			headless: "new",
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-gpu",
			],
		};
		if (process.env.PUPPETEER_EXECUTABLE_PATH) {
			launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
		}
		const browser = await puppeteer.launch(launchOptions);
		const page = await browser.newPage();

		// Construct the Final HTML - v2 Sublease Agreement styling
		const fullContent = `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 40px; line-height: 1.6; font-size: 11px; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .content { min-height: 200px; margin-bottom: 50px; }
                    .content .sublease-v2 h4 { margin-top: 16px; margin-bottom: 8px; font-size: 12px; }
                    .content .legal-notice { background: #f9f9f9; padding: 10px; border: 1px solid #ddd; margin-bottom: 20px; font-size: 10px; }
                    .content .footer-note { font-size: 9px; color: #666; margin-top: 20px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
                    .sig-block { width: 45%; border-top: 1px solid #ccc; padding-top: 10px; }
                    .footer { margin-top: 50px; font-size: 10px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Sublease Agreement</h1>
                        <p>Burrow Housing Limited Sublease Agreement v2 • Facilitated by Burrow Housing Limited</p>
                    </div>

                    <div class="content">
                        ${htmlContent}
                    </div>

                    <div class="signatures">
                        <div class="sig-block">
                            <p><strong>Subletter Signature</strong></p>
                            <img src="${listerSignatureUrl}" width="200" style="display:block; margin-bottom:10px;" />
                            <p>Signed: ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div class="sig-block">
                            <p><strong>Subtenant Signature</strong></p>
                            <img src="${tenantSignatureUrl}" width="200" style="display:block; margin-bottom:10px;" />
                            <p>Signed: ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Burrow Housing Limited • Student Subleasing Platform • www.burrowhousing.com</p>
                        <p>Generated on ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

		await page.setContent(fullContent);

		// Generate PDF Buffer
		const pdfBuffer = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: {
				top: "20px",
				bottom: "40px",
				left: "20px",
				right: "20px",
			},
		});

		await browser.close();
		return pdfBuffer;
	} catch (error) {
		console.error("PDF Generation Failed:", error);
		throw new Error("Failed to generate PDF document");
	}
};
