# App Flow Document

# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a new user arrives at the application, they land on a clean teal-accented welcome screen that works smoothly on both desktop and mobile devices. This screen presents options to sign up or sign in using an email address and a chosen password. To create an account, the user taps or clicks the sign-up button, enters their name, email, and a secure password, and then confirms their registration. The system sends a confirmation email, and upon clicking the verification link, the user is automatically logged in and taken to the main chat interface.

For returning users, a sign-in link brings up a form where they enter their email and password. If the credentials match, the user goes directly to the chat view. There is also a “Forgot Password” link beneath the sign-in form. When clicked, it prompts the user to provide their email. The system then sends a password reset link to that address. Following the link lets the user choose a new password, after which they are redirected to the sign-in form and can access the app normally.

From within the app, users can sign out by opening the profile menu in the header and selecting “Sign Out.” This action returns them to the welcome screen. All authentication flows are handled by the built-in auth routes from the starter kit, ensuring secure handling of credentials and password resets.

## Main Dashboard or Home Page

After signing in, the user lands on the main interface with a persistent header and a collapsible sidebar. On larger screens, the sidebar shows icons and labels for Chat, Dashboard, and Settings. On mobile, the sidebar collapses into a drawer accessible by a menu icon in the header. The header also houses a theme toggle and the user’s profile avatar, which opens the menu for signing out or accessing account settings.

The default view is the Chat page, where the user sees a full-height chat area and an input field anchored at the bottom. Above the chat area, a header bar clearly labels the section as “AI Assistant.” This layout keeps the conversation front and center while allowing quick access to other sections.

Navigating to the Dashboard section replaces the chat window with a teal-themed overview page. This page displays three interactive charts stacked vertically on desktop or scrollable on mobile. The first chart shows the number of new leads added today, the second displays overall conversion rate, and the third breaks down the pipeline by lead stages. A prominent “Export Report” button sits at the top of these charts, enabling on-demand Excel exports.

Tapping the Settings section brings up the Account Settings page, where users can update their personal information, change passwords, and configure notification preferences. From any view, users can switch sections either by clicking the corresponding icon in the sidebar or by using the navigation drawer on mobile.

## Detailed Feature Flows and Page Transitions

When the user types a command into the chat input such as “Add a new lead named Jane Doe at Acme Corp, set stage to Prospect,” the AI assistant powered by GPT-5 parses the instruction and highlights recognized fields. If any required field is missing, the assistant follows up with a question like “What email should I use for Jane Doe?” When all details are confirmed, the assistant calls the internal API to create a new lead record in the PostgreSQL database. A confirmation message appears in the chat, stating “Lead Jane Doe at Acme Corp has been added with stage Prospect.”

If the user wants to update a lead, they might enter “Update Jane Doe’s stage to Negotiation and add a note that she requested pricing details.” The AI validates whether Jane Doe exists. If found, the assistant issues an API call to update the stage and attach the optional note. The chat history then shows “Jane Doe’s record has been updated to Negotiation with new note.” If the lead name or company does not match any record, the assistant prompts the user: “I couldn’t find that lead. Do you want to create a new lead instead?” The user can then confirm or refine their request.

Switching to the Dashboard, the user sees charts that reflect the latest data. The app makes a fresh API call when the page loads or when the user navigates back, ensuring real-time metric updates. Expanding any chart on mobile screen is as simple as tapping it, which reveals detailed breakdowns and tooltips. Pressing the “Export Report” button initiates a request to the backend to build an Excel file with columns for name, email, company, stage, notes, and timestamps. The file download begins automatically, and the user can open or save the .xlsx report.

If the user taps the Settings icon, the page transitions smoothly using the starter kit’s router. On the Account Settings page, form fields show the current name and email. A “Change Password” section requires the current password and the new password twice. Hitting “Save Changes” triggers an API call to update the user’s profile or credentials. A success toast appears briefly at the top to confirm the update.

## Settings and Account Management

The Settings section is dedicated to personalizing the user’s experience. Here, users can update their display name and email address. The change email flow requires re-authentication by asking the user to enter their current password. Upon successful update, the system sends a confirmation email to the new address.

Within Settings, there is also a notification preferences subsection. Users can toggle email alerts for new or updated leads. These toggles are styled in teal and reflect mobile accessibility guidelines. Tapping “Save Preferences” writes the new settings to the database and confirms via a subtle on-screen message.

If the user needs to change their password, they enter their current password, choose a new password, and confirm it. The app verifies the current password via the API and then updates the stored hash. After changing the password, the user is asked to sign in again for security. From there, they return to the Chat or Dashboard seamlessly.

After completing any settings update, a “Back to Dashboard” button or clicking the Dashboard icon in the sidebar returns the user to the main flow.

## Error States and Alternate Paths

Whenever a user enters invalid data, such as an improperly formatted email or a password that is too short, the form fields show inline error messages in red beneath the input. The assistant in the chat interface also handles errors gracefully. If an API call fails due to network issues, the chat area shows a system message stating “Something went wrong. Please check your connection and try again.” The chat input remains enabled so the user can retry their command.

Loss of connectivity triggers a full-screen overlay on mobile or a banner at the top on desktop, informing the user of offline status. As soon as the connection is restored, the overlay disappears and any unsent chat messages are automatically retried.

If a user attempts to export a report when there are no leads, the Export Report button is disabled and a tooltip reads “No leads available to export.” Trying to add a duplicate lead name prompts the assistant to confirm if they intended to update the existing record instead of creating a new one.

At any point, pressing the sign out option clears the session and returns the user to the welcome page. If the session expires due to inactivity, the user sees a modal telling them their session has ended and prompting them to sign in again.

## Conclusion and Overall App Journey

From the first moment the user signs up with their email to the daily routine of chatting with the AI assistant, this application provides a seamless and intuitive way to manage sales leads. The core journey starts with authentication, moves directly into the chat interface for adding or updating lead data through natural language, and flows smoothly into visual insights on the Dashboard. On-demand Excel exports let the user pull all lead data instantly, while Settings pages ensure personal information and preferences stay up to date. Error handling and offline support keep the user informed and able to continue work without losing progress. With a single role and a mobile-friendly design, each individual salesperson or marketer can efficiently track their pipeline from anywhere, ending the day confident that their CRM records are always accurate and accessible.


---
**Document Details**
- **Project ID**: 035d385e-0595-41b5-ab10-8b244d5ee4d3
- **Document ID**: c68e208b-d7f3-4836-a9ac-470561573174
- **Type**: custom
- **Custom Type**: app_flow_document
- **Status**: completed
- **Generated On**: 2025-10-05T12:58:15.800Z
- **Last Updated**: 2025-10-07T11:47:08.269Z
