import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    user: string;
    password: string;
    database: string;
    host: string;
  };
  email: {
    from_email: string;
    gmail_app_password: string;
  };
  auth: {
    jwt_secret: string;
    jwt_expires_in: string;
  };
  payment: {
    paystack_api_key: string;
  };
  cloudinary: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    host: process.env.DB_HOST as string,
  },
  email: {
    from_email: process.env.EMAIL_SENDER as string,
    gmail_app_password: process.env.GMAIL_APP_PASSWORD as string,
  },
  auth: {
    jwt_secret: process.env.JWT_SECRET as string,
    jwt_expires_in: process.env.JWT_EXPIRES_IN as string,
  },
  payment: {
    paystack_api_key:
      process.env.NODE_ENV === 'development'
        ? (process.env.PAYSTACK_API_TEST_KEY as string)
        : (process.env.PAYSTACK_API_PROD_KEY as string),
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  },
};

export default config;
