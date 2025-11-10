// Learning Platform Type Definitions

export interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio?: string;
}

export interface Video {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  vimeoId: string;
  duration: string; // Format: "MM:SS"
  chapter?: string;
  orderIndex: number;
  isPreview: boolean;
  requiredMembership: 'free' | 'premium';
  requiredQualifications?: string[];
  thumbnailUrl?: string;
  completed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string; // Total duration
  students: number;
  rating: number;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  requiredMembership: 'free' | 'premium';
  requiredQualification?: string;
  instructor: Instructor;
  learningPoints: string[];
  videos: Video[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  type: 'experience' | 'observation' | 'training';
  description: string;
  date: Date;
  location: string;
  locationType: 'in-person' | 'online';
  capacity: number;
  enrolled: number;
  price: number;
  requiredMembership: 'free' | 'premium';
  requiredQualifications?: string[];
  imageUrl?: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Qualification {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  requirements: string[];
  obtainedAt?: Date;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  membershipType: 'free' | 'premium';
  joinDate: Date;
  lastActive: Date;
  qualifications: Qualification[];
  coursesEnrolled: string[];
  coursesCompleted: string[];
  activitiesAttended: string[];
  totalSpent: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'important' | 'warning' | 'success';
  targetType: 'all' | 'membership' | 'qualification' | 'individual';
  targetMembershipType?: 'all' | 'premium' | 'free';
  targetQualificationType?: string;
  targetMemberId?: string;
  sentAt?: Date;
  sentBy?: string;
  readAt?: Date;
  deletedAt?: Date;
  status: 'draft' | 'sent';
  recipientCount?: number;
  readCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseProgress {
  memberId: string;
  courseId: string;
  completedVideos: string[];
  lastWatchedVideoId?: string;
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
}

export interface ActivityRegistration {
  id: string;
  activityId: string;
  memberId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  registeredAt: Date;
  cancelledAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreateCourseInput {
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  price: number;
  level: Course['level'];
  requiredMembership: Course['requiredMembership'];
  instructorId: string;
  learningPoints: string[];
}

export interface CreateActivityInput {
  title: string;
  type: Activity['type'];
  description: string;
  date: Date;
  location: string;
  locationType: Activity['locationType'];
  capacity: number;
  price: number;
  requiredMembership: Activity['requiredMembership'];
  requiredQualifications?: string[];
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: Notification['type'];
  targetType: Notification['targetType'];
  targetMembershipType?: Notification['targetMembershipType'];
  targetQualificationType?: string;
  targetMemberId?: string;
  sendImmediately: boolean;
  scheduledAt?: Date;
}

export interface CreateVideoInput {
  courseId: string;
  title: string;
  description?: string;
  vimeoId: string;
  duration: string;
  chapter?: string;
  orderIndex: number;
  isPreview: boolean;
  requiredMembership: Video['requiredMembership'];
  requiredQualifications?: string[];
}

// Filter Types
export interface CourseFilters {
  level?: Course['level'];
  membership?: Course['requiredMembership'];
  priceRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface ActivityFilters {
  type?: Activity['type'];
  status?: Activity['status'];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface MemberFilters {
  membershipType?: Member['membershipType'];
  qualifications?: string[];
  search?: string;
}
