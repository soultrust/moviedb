import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import Downshift from 'downshift'

const AddProjectMembersForm = (props) => {
  return (
    <Fragment>
      <h2>Add Project Members</h2>
      <form>
        <input type="text" placeholder="Search members" />
        <Downshift>
          {(downshift) => (
            <div>
              <label>blah</label>
              <input {...downshift.getInputProps()} />
              <ul></ul>
            </div>
          )}
        </Downshift>
      </form>
    </Fragment>
  )
}

export default AddProjectMembersForm
