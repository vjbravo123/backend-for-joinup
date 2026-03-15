import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  location!: string;

  @Prop({ required: true })
  time!: string; // e.g., 'Today 6:30 AM'

  @Prop({ default: 1 })
  participantsJoined!: number;

  @Prop({ required: true })
  maxParticipants!: number;

  @Prop({ default: 'Free' })
  price!: string;

  // reference to User
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  host!: Types.ObjectId;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Include virtual id instead of _id
ActivitySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: unknown, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});
