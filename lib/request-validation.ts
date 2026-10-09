export type ContactValues = {
    name: string;
    phone: string;
    email: string;
    purpose: string;
    type: string;
    message: string;
};
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
export function validateContact(values: ContactValues): ContactErrors {
    const errors: ContactErrors = {};
    if (values.name.trim().length < 2)
        errors.name = 'Informe seu nome com pelo menos 2 caracteres.';
    const digits = values.phone.replace(/\D/g, '');
    if (!values.phone.trim() && !values.email.trim()) {
        errors.phone = 'Informe um telefone ou e-mail para retorno.';
        errors.email = 'Você pode informar o e-mail ou o telefone.';
    }
    else {
        if (values.phone.trim() && !/^((55)?\d{10,11})$/.test(digits))
            errors.phone = 'Use DDD e um telefone com 10 ou 11 dígitos.';
        if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
            errors.email = 'Confira o endereço de e-mail.';
    }
    if (values.message.trim().length < 10)
        errors.message = 'Conte um pouco mais: escreva pelo menos 10 caracteres.';
    return errors;
}
