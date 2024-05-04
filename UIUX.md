- We use different colors to indicate different actions/content types:
    - When indicating a user's booking state
        - Yellow means pending
        - Red means declined
        - Green means accepted
    - When indicating an action
        - Blue to indicate a primary action: create, confirm ...
        - Green to indicate a success action: save, confirm create ...
        - Red to indicate a danger action: delete
        - Gray to indicate a secondary action: cancel
- We keep two sides of the page empty when the screen is wide, so user can concentrate on the centre part.
- We use grid to manage the layout, so when there are too many things in one row, the columns of the same type are
  aligned.
- When indicating some important information, we will **bold** them:
    - How long and how much is the user going to pay for the listing
    - How many bedrooms/beds/bathrooms is in the listing
- In each unique page/modal, we have a header to tell the user where is the user/what is this page about.
- We add loading animation for fetching and analysing data before we display the content to the user. User will not see
  empty/white page if the content is not fully ready.
- We will display *Page Not Found* when URL is incorrect or the `listingId` is incorrect so user will check their URL
  or `listingId`.
- When there is an error in user's input, we will show the button(to proceed) in disabled mode.
- Clicking the brand `MyAirBRB` in the top bar leads user to the home page.
- In 2.6.3: during analysing json file, we set a short delay after each creation (to let server have a break), and use a
  progress bar to tell user the progress.