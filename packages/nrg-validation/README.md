# @ianwalter/nrg-validation
> Pragmatic validation for Node.js

## Example Usage

### Implementation

```js
import {
  SchemaValidator,
  isEmail,
  isString,
  isStrongPassword,
  isPhone,
  isOptional,
  Validation,
  ValidationError
} from '@ianwalter/nrg-validation'

// Custom validator example:
const msg = 'Occupation must contain software.'
const mustContainSoftware = occupation => (
  new Validation(occupation.toLowerCase().includes('software') || msg)
)

// Create the validator.
const registrationValidator = new SchemaValidator({
  email: { isEmail },
  name: { isString },
  password: { isStrongPassword, message: 'Your password must be stronger.' },
  occupation: { mustContainSoftware },
  phone: { isPhone, isOptional, name: 'telephone number' }
})

try {
  // Validate the input.
  await registrationValidator.validate(req.body).orThrow()

  // Continue to do something here.
} catch (error) {
  if (error instanceof ValidationError) {
    // If the error is a ValidationError, respond with the invalid results.
    res.status(400).json(error.feedback)
  } else {
    res.status(500).end()
  }
}
```

### Input (req.body):

```json
{
  "email": "hahahaha",
  "name": "",
  "password": "qwerty",
  "occupation": "CEO",
  "phone": "777"
}
```

### Output (validation):

```js
{
  email: ['A valid email address is required.'],
  name: ['Name is required.'],
  password: ['Your password must be stronger.'],
  occupation: ['Occupation must contain software.'],
  phone: ['A valid telephone number is required.']
}
```


## Bundled Validators

### Basic Types

Name      | Descriptionn                                                       |
----------|--------------------------------------------------------------------|
isString  | Validates whether input is a String.                               |

### Advanced Types

Name             | Descriptionn                                                |
-----------------|-------------------------------------------------------------|
isTimestamp      | Validates whether input is a valid ISO8601 timestamp.       |
                 | Valid example: '2018-01-01T00:00:00.000Z'                   |
isEmail          | Validates whether input is a valid email address.           |
                 | Valid example: sharonjones@hotmail.com                      |
                 | Invalid example: ting#fastmail.com                          |
isPhone          | Validates whether input is a valid phone number.            |
isStrongPassword | Validates whether input is a strong (has a score of 3 or 4) |
                 | password using [zxcvbn](https://github.com/dropbox/zxcvbn)  |
                 | Valid example: 'Dmbu5bc5yeCRwsRD'                           |
                 | Invalid example: 'qwerty'                                   |
isUrl            | Validates whether input is a valid URL.                     |
isZip            | Validates wehther input is a valid zip code.                |


## Non-validator Options

Name       | Description                                                       |
-----------|-------------------------------------------------------------------|
name       | Allows you to customize the name of the field as it appears in    |
           | the error message. If this is not specified, the error message    |
           | will use a default specified by the validator used or the object  |
           | key.                                                              |
message    | Allows you to set the error message.                              |
isOptional | Allows you to mark the field as optional/not required.            |


## License

Hippocratic License - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://ianwalter.dev)

[licenseUrl]: https://github.com/ianwalter/nrg/blob/main/packages/nrg-validation/LICENSE
