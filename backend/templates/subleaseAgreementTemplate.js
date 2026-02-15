/**
 * Burrow Housing Sublease Agreement v2
 * Legal template — Revised with Legal Counsel Feedback
 * DO NOT modify legal language without legal review.
 */

const SUBLEASE_AGREEMENT_V2_HTML = `
<div class="sublease-v2">
<p class="legal-notice"><strong>IMPORTANT NOTICE:</strong> THIS DOCUMENT IS PROVIDED FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE LEGAL ADVICE. BURROW HOUSING STRONGLY RECOMMENDS THAT BOTH PARTIES CONSULT WITH A LICENSED ATTORNEY BEFORE SIGNING ANY SUBLEASE AGREEMENT. USE OF THIS TEMPLATE IS ENTIRELY AT YOUR OWN RISK.</p>

<h4>PLATFORM ROLE AND DISCLAIMER</h4>
<p>Burrow Housing, Inc. ("Burrow" or "Platform") is a technology platform that facilitates connections between potential subletters and subtenants. Burrow is NOT a party to this Agreement and shall not be bound by any of its terms.</p>
<p>Burrow is not a real estate broker, agent, property manager, landlord, or legal representative of either party. Burrow does not act as an agent or fiduciary for the Subletter, the Subtenant, or any landlord or property owner. Nothing in this Agreement or in the use of the Platform shall be construed as creating an agency, partnership, joint venture, employment, or fiduciary relationship between Burrow and any user of the Platform.</p>
<p>Burrow does not own, manage, maintain, or control any property listed on the Platform. Burrow does not verify, warrant, or guarantee the accuracy, completeness, or reliability of any listing, property description, photograph, amenity claim, rental price, or any other information provided by users on the Platform. All property information is provided solely by the Subletter and has not been independently verified by Burrow.</p>
<p>Burrow does not guarantee the condition, habitability, safety, legality, or suitability of any property. Burrow makes no representations regarding whether any property complies with applicable building codes, zoning regulations, health and safety standards, or any other legal requirements.</p>
<p>Burrow has no role in the negotiation, execution, performance, or enforcement of this Agreement or any sublease transaction. Any disputes arising under this Agreement are solely between the Subletter and the Subtenant.</p>
<p>By using the Platform and/or signing this Agreement, both parties acknowledge and agree that Burrow shall have no liability whatsoever arising from or related to this Agreement, any sublease transaction, any property condition, any misrepresentation by either party, or any other matter related to the use of the Platform.</p>

<h4>AGREEMENT</h4>
<p>This Sublease Agreement ("Agreement") is entered into on <strong>{{Effective_Date}}</strong> ("Effective Date"), by and between the following individuals:</p>

<p><strong>Subletter (Original Tenant):</strong><br/>
Name: <strong>{{Subletter_Name}}</strong><br/>
Email: <strong>{{Subletter_Email}}</strong><br/>
Phone: <strong>{{Subletter_Phone}}</strong></p>

<p><strong>Subtenant (Incoming Tenant):</strong><br/>
Name: <strong>{{Subtenant_Name}}</strong><br/>
Email: <strong>{{Subtenant_Email}}</strong><br/>
Phone: <strong>{{Subtenant_Phone}}</strong></p>

<p>This Agreement is solely between the Subletter and the Subtenant. Burrow Housing is not a party to this Agreement, does not endorse or guarantee its terms, and assumes no responsibility for its enforcement, performance, or any outcome arising from it.</p>

<h4>1. Property</h4>
<p>The Subletter agrees to sublease to the Subtenant the following property:</p>
<p>Address: <strong>{{Address}}</strong><br/>
Unit / Room (if applicable): <strong>{{Unit_Room}}</strong><br/>
Furnished: <strong>{{Furnished}}</strong></p>
<p>The Subletter represents that they have the legal right to sublease this property and that subleasing does not violate the terms of their original lease or any applicable law, regulation, or homeowners association rule. The Subtenant acknowledges that Burrow has not verified and makes no representation regarding the Subletter's right to sublease.</p>

<h4>2. Term</h4>
<p>The sublease shall commence on <strong>{{Start_Date}}</strong> ("Start Date") and terminate on <strong>{{End_Date}}</strong> ("End Date"), unless terminated earlier in accordance with the terms of this Agreement.</p>
<p>This is a temporary sublease for the specified term only. This Agreement does not grant the Subtenant any ownership interest in the property, any right to renew or extend the sublease, or any right of first refusal for future tenancy.</p>

<h4>3. Rent</h4>
<p>Monthly Rent Amount: <strong>{{Rent_Amount}}</strong></p>
<p>Rent is due on the <strong>{{Rent_Due_Day}}</strong> day of each month.</p>
<p>Rent shall be paid via: <strong>{{Payment_Method}}</strong></p>
<p>Late payment: If rent is not received within <strong>{{Late_Fee_Days}}</strong> days of the due date, a late fee of <strong>{{Late_Fee_Amount}}</strong> may be assessed by the Subletter.</p>
<p>Failure to pay rent on time may constitute a material breach of this Agreement and may result in termination, subject to applicable law and any required notice periods.</p>
<p>If payment is processed through the Burrow Platform, Burrow acts solely as a payment processor and assumes no liability for payment disputes between the parties. Burrow's facilitation of payment does not create any landlord-tenant, agency, or fiduciary relationship.</p>

<h4>4. Security Deposit</h4>
<p>Security Deposit Amount: <strong>{{Security_Deposit}}</strong></p>
<p>The security deposit shall be paid directly to the Subletter on or before the Start Date.</p>
<p>Burrow Housing does not collect, hold, manage, or escrow security deposits. The Subletter is solely responsible for holding, managing, and returning the security deposit in accordance with Massachusetts General Laws Chapter 186, Section 15B, and any other applicable law.</p>
<p>The Subletter shall return the security deposit (less any lawful deductions with itemized documentation) within thirty (30) days of the termination of this Agreement or the Subtenant's vacating of the property, whichever occurs later.</p>

<h4>5. Utilities and Fees</h4>
<p>The Subtenant is responsible for the following utilities and fees: <strong>{{Utilities}}</strong></p>
<p>Payment method for utilities: <strong>{{Utility_Payment_Method}}</strong><br/>
Estimated monthly utility cost: <strong>{{Estimated_Utility_Cost}}</strong></p>
<p>The parties shall clearly agree on which utilities are included in rent and which are the separate responsibility of the Subtenant. Any utility accounts that remain in the Subletter's name shall be promptly paid by the responsible party.</p>

<h4>6. Condition of Property</h4>
<p>The Subtenant acknowledges that they have had the opportunity to inspect the property (either in person or through Burrow's Ambassador inspection service) and accepts the property in its current condition, subject to normal wear and tear.</p>
<p>The Subtenant acknowledges and agrees that any inspection conducted through the Burrow Ambassador program is provided as a convenience only and does not constitute a professional property inspection, appraisal, or guarantee of property condition. Burrow and its Ambassadors make no warranties regarding the accuracy or completeness of any inspection report. The Subtenant is solely responsible for satisfying themselves as to the condition and suitability of the property.</p>
<p>Both parties are strongly encouraged to complete and sign a separate Move-In/Move-Out Condition Checklist documenting the condition of the property at the start and end of the sublease, including photographs.</p>
<p>Existing issues documented at move-in: <strong>{{Existing_Issues}}</strong></p>

<h4>7. Use of Property</h4>
<p>The property shall be used for residential purposes only. The Subtenant agrees to: comply with all building rules, policies, and community guidelines; not engage in any illegal activity on or about the premises; not create disturbances or nuisances that affect other tenants or neighbors; not make any alterations or modifications to the property without the Subletter's prior written consent; not permit any additional occupants without the Subletter's prior written consent; maintain the property in a clean and habitable condition.</p>

<h4>8. Original Lease Compliance</h4>
<p>The Subtenant agrees to comply with all applicable terms of the original lease between the Subletter and the landlord/property owner, to the extent those terms apply to occupancy, use, and conduct on the premises.</p>
<p>The Subletter represents and warrants that: (a) they have obtained all necessary permissions to sublease the property, including written consent from the landlord if required; (b) subleasing does not violate the terms of the original lease; and (c) they will provide a copy of relevant portions of the original lease to the Subtenant upon request.</p>
<p>Burrow has not reviewed the original lease and makes no representations regarding whether the Subletter is authorized to sublease the property. The Subtenant is encouraged to request and review the original lease and verify the Subletter's authorization independently.</p>

<h4>9. Maintenance and Damages</h4>
<p>The Subtenant is responsible for any damage to the property caused beyond normal wear and tear during the sublease term. The Subtenant must promptly notify the Subletter in writing of any maintenance issues, damages, or hazardous conditions. The Subletter shall use reasonable efforts to address maintenance requests or escalate them to the landlord/property management as appropriate.</p>
<p>Neither party shall hold Burrow responsible for any property maintenance, repairs, damages, or conditions of the property.</p>

<h4>10. Termination</h4>
<p>This Agreement may be terminated: automatically at the end of the stated term (End Date); by mutual written agreement of both parties at any time; by the Subletter upon material breach by the Subtenant, subject to applicable law and any required notice periods; by the Subtenant upon material breach by the Subletter, subject to applicable law and any required notice periods; as otherwise permitted by applicable law.</p>
<p>Early termination terms (if any): <strong>{{Early_Termination_Terms}}</strong></p>
<p>Required notice period for early termination: <strong>{{Notice_Period_Days}}</strong> days</p>
<p>Upon termination, the Subtenant shall vacate the property, return all keys and access devices, and leave the property in the condition it was received, subject to normal wear and tear.</p>

<h4>11. No Assignment or Further Subletting</h4>
<p>The Subtenant may not assign this Agreement, or further sublease or transfer occupancy of the property (or any portion thereof), to any third party without the prior written consent of the Subletter.</p>

<h4>12. Assumption of Risk and Acknowledgment</h4>
<p>Both parties acknowledge that subletting inherently involves risks, including but not limited to financial loss, property damage, misrepresentation by either party, and disputes regarding lease terms or property condition. Both parties expressly assume all risks associated with entering into this Agreement and using the Burrow Housing Platform. Each party is solely responsible for conducting their own due diligence regarding the other party, the property, the terms of the sublease, and compliance with all applicable laws.</p>
<p>The Subtenant specifically acknowledges that: (a) Burrow has not verified the identity, background, or creditworthiness of the Subletter; (b) Burrow has not verified the accuracy of any property listing, description, or photograph; (c) Burrow has not verified the Subletter's legal right to sublease; and (d) any representations about the property were made solely by the Subletter, not by Burrow.</p>
<p>The Subletter specifically acknowledges that: (a) Burrow has not verified the identity, background, or creditworthiness of the Subtenant; (b) Burrow does not guarantee payment of rent or performance of any obligation by the Subtenant; and (c) the Subletter is solely responsible for vetting the Subtenant.</p>

<h4>13. Liability, Indemnification, and Waiver</h4>
<p>Each party agrees to be responsible for their own actions and omissions. Neither party shall hold the other liable for losses except as required by applicable law.</p>
<p><strong>Release and Waiver Regarding Burrow Housing:</strong> Both the Subletter and the Subtenant, on behalf of themselves and their respective heirs, successors, and assigns, hereby release, discharge, and waive any and all claims, demands, actions, causes of action, suits, damages, losses, costs, expenses (including attorneys' fees), and liabilities of any kind, whether known or unknown, arising out of or in any way related to: this Agreement or any sublease transaction facilitated through the Platform; any property condition, defect, or hazard; any misrepresentation, omission, or fraud by the Subletter, the Subtenant, or any third party; any listing information, photographs, descriptions, or other content on the Platform; any Ambassador inspection report or related services; any payment processing through the Platform; any personal injury, property damage, or financial loss.</p>
<p><strong>Limitation of Liability:</strong> In no event shall Burrow Housing, its officers, directors, employees, agents, affiliates, or Ambassadors be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from or related to this Agreement, the Platform, or any sublease transaction, even if Burrow has been advised of the possibility of such damages.</p>
<p><strong>Indemnification:</strong> Each party agrees to indemnify, defend, and hold harmless Burrow Housing, its officers, directors, employees, agents, affiliates, and Ambassadors from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising from or related to: (a) such party's breach of this Agreement; (b) such party's use of the Platform; (c) such party's misrepresentation or fraud; or (d) such party's violation of any applicable law.</p>

<h4>14. Dispute Resolution</h4>
<p>Any dispute arising under this Agreement shall be resolved between the Subletter and the Subtenant. Burrow Housing shall not be required to participate in, mediate, or resolve any dispute between the parties. The parties agree to attempt to resolve any dispute through good-faith negotiation before pursuing any legal action. If the dispute cannot be resolved through negotiation, the parties may pursue remedies available under applicable law.</p>

<h4>15. Governing Law</h4>
<p>This Agreement shall be governed by and construed in accordance with the laws of the Commonwealth of Massachusetts, without regard to its conflict of laws principles.</p>

<h4>16. Severability</h4>
<p>If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.</p>

<h4>17. Notices</h4>
<p>All notices required or permitted under this Agreement shall be in writing and delivered to the email addresses listed above, or to such other address as a party may designate in writing.</p>

<h4>18. Entire Agreement</h4>
<p>This Agreement constitutes the entire understanding between the Subletter and the Subtenant regarding the sublease and supersedes any prior discussions, representations, or agreements, whether written or oral. No modification of this Agreement shall be valid unless in writing and signed by both parties.</p>
<p>This Agreement does not modify, supersede, or affect the Burrow Housing Terms of Service, Privacy Policy, or any other agreement between either party and Burrow Housing, all of which remain in full force and effect.</p>

<h4>19. Signatures</h4>
<p>By signing below, both parties acknowledge that they have read, understood, and voluntarily agreed to all terms of this Agreement. Both parties further acknowledge that they have been advised to seek independent legal counsel and have had a reasonable opportunity to do so.</p>
<p><strong>Subletter:</strong> (Signature collected electronically)</p>
<p><strong>Subtenant:</strong> (Signature collected electronically)</p>
<p class="footer-note">Burrow Housing • Student Subleasing Platform • www.burrowhousing.com<br/>
This document is a sample template only. Burrow Housing is not a law firm and does not provide legal services.</p>
</div>
`;

/**
 * Default variable keys and suggested values for the v2 sublease agreement.
 * Values are pre-filled from property and user data when possible.
 */
function getDefaultVariables(property, lister, tenant) {
	const today = new Date();
	const effectiveDate = today.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return {
		Effective_Date: effectiveDate,
		Subletter_Name: lister?.name || "",
		Subletter_Email: lister?.email || "",
		Subletter_Phone: lister?.phone || "",
		Subtenant_Name: tenant?.name || "",
		Subtenant_Email: tenant?.email || "",
		Subtenant_Phone: tenant?.phone || "",
		Address: property?.addressAndLocation?.address || "",
		Unit_Room: "",
		Furnished: "", // Yes / No / Partially
		Start_Date: "",
		End_Date: "",
		Rent_Amount: property?.overview?.rent ? `$${property.overview.rent}` : "",
		Rent_Due_Day: "1",
		Payment_Method: "Burrow Housing Platform (subject to Platform terms of service and applicable fees)",
		Late_Fee_Days: "5",
		Late_Fee_Amount: "$50",
		Security_Deposit: "",
		Utilities: "Electricity, Gas, Water/Sewer, Internet/Wi-Fi (check those that apply)",
		Utility_Payment_Method: "",
		Estimated_Utility_Cost: "",
		Existing_Issues: "None",
		Early_Termination_Terms: "As mutually agreed in writing",
		Notice_Period_Days: "30",
	};
}

module.exports = {
	SUBLEASE_AGREEMENT_V2_HTML,
	getDefaultVariables,
};
