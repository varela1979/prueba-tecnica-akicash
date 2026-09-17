import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsAfterOrEqual(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAfterOrEqual',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: Date, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!value || !relatedValue) return true;

          return new Date(value) >= new Date(relatedValue);
        },
        defaultMessage(args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        return `${args.property} must be equal to or after ${relatedPropertyName}`;
        },
      },
    });
  };
}