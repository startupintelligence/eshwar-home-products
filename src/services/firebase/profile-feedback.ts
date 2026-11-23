import { signInAnonymously, signOut } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { auth, db } from "./client";
export type FeedbackKind = "reviews" | "comments";
export type ProfileFeedbackRecord = { id:string; customerName:string; rating?:number; reviewText?:string; commentText?:string; status:"pending"|"approved"|"rejected"; createdAt?:{toDate?:()=>Date}|Date|null };
function collectionName(kind:FeedbackKind){return kind==="reviews"?"customer_reviews":"customer_comments";}
async function ensureAnonymousUser(){
 if(!auth||!db)throw new Error("Customer feedback is not connected yet. Please contact the store directly.");
 if(auth.currentUser&&!auth.currentUser.isAnonymous)await signOut(auth);
 if(!auth.currentUser)await signInAnonymously(auth);
 if(!auth.currentUser?.isAnonymous)throw new Error("Could not start a secure guest session. Please try again.");
 return auth.currentUser;
}
export async function submitProfileFeedback(kind:FeedbackKind,input:{customerName:string;rating?:number;message:string}){
 const user=await ensureAnonymousUser();if(!db)throw new Error("Feedback service is unavailable.");
 const cleanName=input.customerName.trim().replace(/\s+/g," ");const cleanMessage=input.message.trim();
 if(cleanName.length<2||cleanName.length>60)throw new Error("Enter a name between 2 and 60 characters.");
 if(kind==="reviews"&&(!Number.isInteger(input.rating)||Number(input.rating)<1||Number(input.rating)>5))throw new Error("Choose a rating from 1 to 5 stars.");
 if(cleanMessage.length<(kind==="reviews"?15:5)||cleanMessage.length>(kind==="reviews"?1200:1000))throw new Error("Please check the message length and try again.");
 const limitRef=doc(db,"public_submission_limits",user.uid);const previous=await getDoc(limitRef);const batch=writeBatch(db);
 batch.set(limitRef,{lastSubmittedAt:serverTimestamp()});const feedbackRef=doc(collection(db,collectionName(kind)));
 const record=kind==="reviews"?{customerName:cleanName,rating:input.rating,reviewText:cleanMessage,status:"pending",createdAt:serverTimestamp()}:{customerName:cleanName,commentText:cleanMessage,status:"pending",createdAt:serverTimestamp()};
 batch.set(feedbackRef,record);
 try{await batch.commit();}catch(error){if(previous.exists())throw new Error("Please wait a minute before sending another message. Your earlier submission may still be awaiting review.");throw error;}
}
export async function getApprovedFeedback(kind:FeedbackKind):Promise<ProfileFeedbackRecord[]>{
 if(!db)return[];const snapshot=await getDocs(query(collection(db,collectionName(kind)),where("status","==","approved")));
 return snapshot.docs.map(item=>({id:item.id,...item.data()}) as ProfileFeedbackRecord).sort((a,b)=>dateValue(b.createdAt)-dateValue(a.createdAt));
}
export async function getPendingFeedback(kind:FeedbackKind):Promise<ProfileFeedbackRecord[]>{
 if(!db)return[];const snapshot=await getDocs(query(collection(db,collectionName(kind)),where("status","==","pending"),limit(100)));
 return snapshot.docs.map(item=>({id:item.id,...item.data()}) as ProfileFeedbackRecord).sort((a,b)=>dateValue(a.createdAt)-dateValue(b.createdAt));
}
function dateValue(value:ProfileFeedbackRecord["createdAt"]){if(value&&typeof value==="object"&&"toDate"in value&&typeof value.toDate==="function")return value.toDate().getTime();return value instanceof Date?value.getTime():0;}
export async function moderateProfileFeedback(kind:FeedbackKind,id:string,status:"approved"|"rejected"){if(!db)throw new Error("Moderation service is unavailable.");await updateDoc(doc(db,collectionName(kind),id),{status,updatedAt:serverTimestamp()});}
export async function deleteProfileFeedback(kind:FeedbackKind,id:string){if(!db)throw new Error("Moderation service is unavailable.");await deleteDoc(doc(db,collectionName(kind),id));}
