/* eslint-disable no-use-before-define */
import React from 'react';
import axios from 'axios'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';


export default function SearchProjectsPeople() {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(open && options.length === 0);

  React.useEffect(() => {
    let active = true;

    (async () => {
      if (!inputValue) {
        setOptions([]);
        return undefined;
      }
      setLoading(true);
      const combinedReqs = ['/api/v1/projects', '/api/v1/persons'].map(url => {
        return axios.get(`${url}?keywords=${inputValue}`);
      });
      const leanFlattened = [];

      await Promise.all(combinedReqs)
        .then(resultGroups => {
          resultGroups.forEach(group => {
            leanFlattened.push(...group.data.data);
          });
          return leanFlattened;
        })
        .then((options) => {
          if (active) {
            setOptions(options);
            setLoading(false);
          }
        })
        .catch(resp => console.log(resp))
    })();

    return () => {
      active = false;
    };
  }, [inputValue]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);



  return (
    <Autocomplete
      className="autocomplete"
      id="grouped-demo"
      groupBy={(option) => {
        if (option.type === 'person') {
          return 'PEOPLE';
        }
        return 'PROJECTS'
      }}
      getOptionLabel={(option) => {
        return option.attributes.title || option.attributes.full_name
      }}
      value={value}
      onChange={(_, newValue) => {
        // setValue(newValue);
        console.log(newValue)
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      open={open && inputValue.length > 0}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionSelected={(option, value) => {
        return option.id === value.id;
      }}
      options={options}
      loading={loading}
      noOptionsText="No results"
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Projects and People"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}