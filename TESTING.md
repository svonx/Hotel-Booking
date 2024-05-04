# test: happy path 1

## 1. register/login/logout function

- first navigate to root URL `/`
- click `login` and navigate to login page
- click `no account yet?` and navigate to register page
- enter details and register
- if email already taken, go to login page and log in
- after register/login success, user should be in all listings page

## 2. creating list correctly

- go to my host page
- click on `create` button
- enter details
    - for the image, choose `src/assets/house-test.jpg`
- check if amenity checkboxes work well
- if all details is filled, user should be navigated to my host page and see their listing

## 3. update a listing

- in my host page, click the pencil button
- update the host name and thumbnail
    - for the image, choose `src/assets/house-edit.jpg`
- click save, and observe that the name and image are updated

## 4. publish this list

- in my host page, find the listing, click the `not-visible` icon to publish
- add an available time period
- (add another one, and then remove it)
- click `publish`
- in all listings page, we ought to see this listing.

## 5. unpublish test

- in my host page, find the listing, click the `visible` icon
- click `confirm` to unpublish

## 6. make booking

- logout and register a customer account to book this listing
- click `book now` to book
- enter the start and end date
- click `proceed`
- we should see a pending status

## 7. logout

- click logout button

## 8. login back

- log in back with admin account
- view booking requests of this listing
- click `accept`
- "pending" should become "accepted"