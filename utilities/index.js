// utilities/index.js
const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += '<li><a href="/inv" title="Manage the Inventory">Management</a></li>'
  list += "</ul>"
  return list
}
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Helper functions for formatting
* ************************************ */
Util.formatCurrencyUSD = function (value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

Util.formatNumber = function (value) {
  return new Intl.NumberFormat('en-US').format(value)
}

/* **************************************
* Build vehicle detail HTML
* ************************************ */
Util.wrapVehicleAsHTML = function (vehicle) {
  const price = Util.formatCurrencyUSD(vehicle.inv_price || 0)
  const mileage = vehicle.inv_miles ? Util.formatNumber(vehicle.inv_miles) : 'N/A'
  const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`

  return `
    <div class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="${title}" />
      </div>
      <div class="vehicle-info">
        <h1 class="vehicle-title">${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <h2 class="vehicle-sub">${vehicle.inv_year} • ${price}</h2>
        <p class="vehicle-meta"><strong>Mileage:</strong> ${vehicle.inv_miles}</p>
        <p class="vehicle-meta"><strong>Color:</strong> ${vehicle.inv_color || 'N/A'}</p>
        <div class="vehicle-desc">
          <h3>Description</h3>
          <p>${vehicle.inv_description || 'No description available.'}</p>
        </div>
      </div>
    </div>
    <style>
      .vehicle-detail { display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap; }
      .vehicle-image img { max-width: 100%; height: auto; border-radius: 8px; display:block; }
      .vehicle-image { flex: 1 1 420px; max-width: 720px; }
      .vehicle-info { flex: 1 1 320px; min-width: 280px; }
      .vehicle-title { margin: 0 0 .25rem 0; font-size: 1.6rem; }
      .vehicle-sub { margin: 0 0 1rem 0; color: #333; font-size: 1.1rem; }
      .vehicle-meta { margin: .25rem 0; }
      .vehicle-desc { margin-top: 1rem; line-height: 1.5; }
      @media (max-width: 768px) {
        .vehicle-detail { flex-direction: column; }
        .vehicle-image, .vehicle-info { max-width: 100%; }
      }
    </style>
  `
}
Util.buildClassificationList = function (data) {
  let list = `<select name="classification_id" id="classification_id" required>`
  
  data.forEach(row => {
    list += `<option value="${row.classification_id}">${row.classification_name}</option>`
  })

  list += `</select>`
  return list
}





module.exports = Util
