import React, { PropTypes } from 'react'
import s from './OrganizationEdit.css'
import icons from '../../icons/css/icons.css'

import ServiceStatus from '../ServiceStatus'

class OrganizationEdit extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      organization: {phones:[]},
    }
  }

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  handleSubmit = (event)  => {
      // Do some stuff with firebase to login yee
  }

  render() {
    return (
      <div className={s.organizationEditBox}>
        <div className={s.name}>
          <span className={s.nameLabel}>Organization Name </span>
          <input
            type="text"
            value={this.state.organization.name}
            onChange={this.handleChange}
          />
        </div>
        <div className={s.description}>
          <span className={s.descriptionLabel}>Organization Description </span>
          <input
            type="text"
            value={this.state.organization.long_description}
            onChange={this.handleChange}
          />
        </div>
        <div className={s.phonesBox}>
          <span className={s.phoneEditBoxLabel}>Phone Numbers </span>
          {this.state.organization.phones.map((obj) => <PhoneEditBox key={`phone-${obj}`} phone={obj} changeState={this.handleChange} /> )}
          <a>Add a phone number</a>  TODO
        </div>
        <div className={s.urlBox}>
          <span className={s.urlLabel}>Website </span>
          <input
            type="text"
            value={this.state.organization.url}
            onChange={this.handleChange}
          />
        </div>
        <div className={s.loginSubmit}>
          <button type="button" onClick={this.handleSubmit}>Login</button>
        </div>
      </div>
    )
  }
}

const PhoneEditBox = (props) => (
   <div className={s.phoneEditBox}>
     <span className={s.phoneDepartmentLabel}>Department </span>
     <input
       type="text"
       value={props.phone.department}
       onChange={props.phone.changeState}
     />
     <span className={s.phoneNumberLabel}>Number </span>
     <input
       type="text"
       value={props.phone.number}
       onChange={props.changeState}
     />
   </div>
 )

export default OrganizationEdit
