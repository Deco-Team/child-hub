export enum CourseType {
  FREE = 'FREE',
  PAID = 'PAID'
}

export interface ICourse {
  _id: string
  title: string
  description: string
  objective: string
  thumbnail: string
  duration: number
  price: number
  level: string
  status: string
  lessons?: ILesson[]
  createdAt: Date
  updatedAt: Date
  provider: IProvider
  type: CourseType
  completedLessons?: number
  totalLessons?: number
}

export interface IProvider {
  _id: string
  name: string
  image: string
}

export interface ILesson {
  title: string
  description: string
  objective: string
  video: string
  type: string
  isCompleted?: boolean
}

export interface IOrderHistory {
  _id: string
  orderNumber: string
  items: {
    course: ICourse
    price: number
  }[]
  totalAmount: number
  orderDate: Date
  orderStatus: string
  transactionStatus: string
  payment: {
    transactionStatus: string
    transaction: {
      partnerCode: string
      orderId: string
    }
    paymentMethod: string
  }
  createdAt: Date
  updatedAt: Date
}
