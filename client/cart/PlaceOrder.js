import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import auth from './../auth/auth-helper'
import cart from './cart-helper.js'
// import {CardElement, injectStripe} from 'react-stripe-elements'
import {create} from './../order/api-order.js'
import {Redirect} from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  subheading: {
    color: 'rgba(88, 114, 128, 0.87)',
    marginTop: "20px",
  },
  checkout: {
    float: 'right',
    margin: '20px 30px'
  },
  error: {
    display: 'inline',
    padding: "0px 10px"
  },
  errorIcon: {
    verticalAlign: 'middle'
  },
  StripeElement: {
    display: 'block',
    margin: '24px 0 10px 10px',
    maxWidth: '408px',
    padding: '10px 14px',
    boxShadow: 'rgba(50, 50, 93, 0.14902) 0px 1px 3px, rgba(0, 0, 0, 0.0196078) 0px 1px 0px',
    borderRadius: '4px',
    background: 'white'
  }
}))

const PlaceOrder = (props) => {
  const classes = useStyles()
  const [values, setValues] = useState({
    order: {},
    error: '',
    redirect: false,
    orderId: ''
  })

  const placeOrder = ()=>{
    const jwt = auth.isAuthenticated()
    console.log("place-order-1 userId: ", jwt.user._id);
    create({userId:jwt.user._id}, {
        t: jwt.token
        }, props.checkoutDetails).then((data) => {
        if (data.error) {
            console.log("place-order-2 error");
            setValues({...values, error: data.error})
        } else {
            console.log("place-order-3");

        cart.emptyCart(()=> {
            setValues({...values, 'orderId':data._id,'redirect': true})
        })
        }
    })
    }


    if (values.redirect) {
      return (<Redirect to={'/order/' + values.orderId}/>)
    }
    return (
    <span>
      
      <div className={classes.checkout}>
        { values.error &&
          (<Typography component="span" color="error" className={classes.error}>
            <Icon color="error" className={classes.errorIcon}>error</Icon>
              {values.error}
          </Typography>)
        }
        <Button color="secondary" variant="contained" onClick={placeOrder}>Place Order</Button>
      </div>
    </span>)

}
PlaceOrder.propTypes = {
  checkoutDetails: PropTypes.object.isRequired
}

export default PlaceOrder
